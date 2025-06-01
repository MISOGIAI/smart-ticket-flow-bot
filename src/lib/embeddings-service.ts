import { TicketWithRelations } from './ticket-service';
import { OpenAI } from 'openai';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo purposes
});

export interface TicketEmbedding {
  id: string;
  ticket_id: string;
  ticket_number: string;
  embedding: number[];
  metadata: {
    title: string;
    description: string;
    priority: string;
    status: string;
    category_id: string;
    category_name: string;
    department_id: string;
    department_name: string;
    requester_id: string;
    requester_name: string;
    assigned_to: string | null;
    assigned_agent_name: string | null;
    created_at: string;
    resolved_at: string | null;
  }
}

// Local storage key for ticket embeddings
const EMBEDDINGS_STORAGE_KEY = 'ticket_embeddings';

export class EmbeddingsService {
  // Generate embedding for a ticket using OpenAI API
  async generateOpenAIEmbedding(text: string): Promise<number[]> {
    try {
      console.log('🔄 Generating OpenAI embedding...');
      
      // Call the actual OpenAI API with our environment variable key
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      });
      
      console.log('✅ Successfully generated OpenAI embedding');
      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ Error generating OpenAI embedding:', error);
      // Fallback to mock embedding
      return this.generateMockEmbedding(text);
    }
  }
  
  // Generate a mock embedding for development/testing
  generateMockEmbedding(text: string, dimensions: number = 1536): number[] {
    console.log('🔄 Generating mock embedding as fallback');
    // Create a deterministic but unique embedding based on the text
    const hashCode = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) {
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
      }
      return h;
    };
    
    const seed = hashCode(text);
    const embedding = [];
    
    // Generate a pseudo-random but deterministic vector
    let value = seed;
    for (let i = 0; i < dimensions; i++) {
      // Simple LCG random number generator with the hash as seed
      value = (value * 1664525 + 1013904223) % 4294967296;
      // Convert to a number between -1 and 1
      embedding.push((value / 2147483648) - 1);
    }
    
    // Normalize the vector to unit length
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }
  
  // Generate embedding for a ticket with all its metadata
  async generateEmbeddingForTicket(ticket: TicketWithRelations): Promise<TicketEmbedding> {
    console.log(`🔄 Generating embedding for ticket: ${ticket.ticket_number}`);
    
    // Combine relevant ticket fields for embedding
    const textForEmbedding = `
      Title: ${ticket.title}
      Description: ${ticket.description}
      Category: ${ticket.category?.name || ticket.category_name}
      Priority: ${ticket.priority}
      Status: ${ticket.status}
    `;
    
    // Generate embedding
    const embedding = await this.generateOpenAIEmbedding(textForEmbedding);
    
    console.log(`✅ Embedding generated for ticket: ${ticket.ticket_number}`);
    
    // Create embedding object with metadata
    return {
      id: `emb_${Date.now()}_${ticket.id}`,
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
      embedding: embedding,
      metadata: {
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        category_id: ticket.category_id,
        category_name: ticket.category?.name || ticket.category_name,
        department_id: ticket.department_id,
        department_name: ticket.department?.name || '',
        requester_id: ticket.requester_id,
        requester_name: ticket.requester?.name || '',
        assigned_to: ticket.assigned_to,
        assigned_agent_name: ticket.assigned_agent?.name || null,
        created_at: ticket.created_at,
        resolved_at: ticket.resolved_at
      }
    };
  }
  
  // Process a batch of tickets and generate embeddings
  async processTickets(tickets: TicketWithRelations[]): Promise<TicketEmbedding[]> {
    console.log(`🔄 Starting embedding generation for ${tickets.length} tickets...`);
    
    const embeddings: TicketEmbedding[] = [];
    
    for (const ticket of tickets) {
      try {
        const embedding = await this.generateEmbeddingForTicket(ticket);
        embeddings.push(embedding);
        console.log(`✅ Generated embedding ${embeddings.length}/${tickets.length}`);
      } catch (error) {
        console.error(`❌ Error generating embedding for ticket ${ticket.id}:`, error);
      }
    }
    
    console.log(`✅ Successfully generated ${embeddings.length} embeddings`);
    return embeddings;
  }
  
  // Store embeddings in localStorage
  storeEmbeddings(embeddings: TicketEmbedding[]): void {
    console.log(`🔄 Storing ${embeddings.length} embeddings in localStorage...`);
    
    // Get existing embeddings
    const existingEmbeddings = this.getEmbeddings();
    console.log(`📊 Found ${existingEmbeddings.length} existing embeddings`);
    
    // Create a map of existing embeddings by ticket_id for quick lookup
    const embeddingMap = new Map(existingEmbeddings.map(emb => [emb.ticket_id, emb]));
    
    // Update existing embeddings or add new ones
    for (const embedding of embeddings) {
      embeddingMap.set(embedding.ticket_id, embedding);
    }
    
    // Convert map back to array
    const updatedEmbeddings = Array.from(embeddingMap.values());
    
    // Store in localStorage
    try {
      localStorage.setItem(EMBEDDINGS_STORAGE_KEY, JSON.stringify(updatedEmbeddings));
      console.log(`✅ Successfully stored ${updatedEmbeddings.length} embeddings in localStorage`);
    } catch (error) {
      console.error('❌ Error storing embeddings in localStorage:', error);
      
      // If the error is due to localStorage size limits, try storing a reduced version
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.handleStorageLimitError(updatedEmbeddings);
      }
    }
  }
  
  // Handle localStorage size limit error
  private handleStorageLimitError(embeddings: TicketEmbedding[]): void {
    console.warn('⚠️ localStorage quota exceeded, trying to store reduced embeddings');
    
    // Reduce embedding dimensions to save space
    const reducedEmbeddings = embeddings.map(emb => ({
      ...emb,
      // Take only first 100 dimensions of the embedding
      embedding: emb.embedding.slice(0, 100)
    }));
    
    try {
      localStorage.setItem(EMBEDDINGS_STORAGE_KEY, JSON.stringify(reducedEmbeddings));
      console.log(`✅ Stored ${reducedEmbeddings.length} reduced embeddings in localStorage`);
    } catch (error) {
      console.error('❌ Failed to store reduced embeddings:', error);
      
      // If still too large, store only metadata without embeddings
      this.storeOnlyMetadata(embeddings);
    }
  }
  
  // Fallback to store only metadata without embeddings
  private storeOnlyMetadata(embeddings: TicketEmbedding[]): void {
    console.warn('⚠️ Storing only metadata without embeddings as fallback');
    
    const metadataOnly = embeddings.map(({ id, ticket_id, ticket_number, metadata }) => ({
      id, ticket_id, ticket_number, metadata, embedding: []
    }));
    
    try {
      localStorage.setItem(EMBEDDINGS_STORAGE_KEY, JSON.stringify(metadataOnly));
      console.log(`✅ Stored ${metadataOnly.length} metadata-only records in localStorage`);
    } catch (error) {
      console.error('❌ Failed to store even metadata-only embeddings:', error);
    }
  }
  
  // Retrieve embeddings from localStorage
  getEmbeddings(): TicketEmbedding[] {
    try {
      const storedData = localStorage.getItem(EMBEDDINGS_STORAGE_KEY);
      if (!storedData) return [];
      
      const embeddings = JSON.parse(storedData) as TicketEmbedding[];
      return embeddings;
    } catch (error) {
      console.error('❌ Error retrieving embeddings from localStorage:', error);
      return [];
    }
  }
}

export const embeddingsService = new EmbeddingsService();
