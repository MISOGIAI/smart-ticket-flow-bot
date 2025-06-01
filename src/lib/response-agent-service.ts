import OpenAI from "openai";
import { supabase } from '@/integrations/supabase/client';
import { embeddingsService } from "./embeddings-service";

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Interfaces for the response agent system
interface TicketDetails {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  ticket_number: string;
  created_at: string;
  updated_at: string;
  requester: { name: string; email: string } | null;
  category: { name: string } | null;
  department: { name: string } | null;
  assigned_agent: { name: string } | null;
}

interface SimilarTicket {
  id: string;
  title: string;
  description: string;
  response: string;
  resolution_time: string;
  similarity: number;
}

interface AgentResponse {
  response: string;
  confidence: number;
  reasoning: string;
  suggested_status: string;
  suggested_tags: string[];
}

interface ValidationResult {
  isValid: boolean;
  feedback: string;
  improvedResponse?: string;
}

// Department-specific context for the agents
const departmentContexts = {
  "IT Support": `
    You are the IT Support Department's AI response agent. Your goal is to craft helpful, accurate, and human-like responses to IT-related support tickets.
    
    Consider these IT department guidelines:
    - Be technical but accessible - explain complex concepts clearly 
    - Include step-by-step instructions when possible
    - Reference knowledge base articles when appropriate
    - For hardware/software issues, include basic troubleshooting steps
    - Set clear expectations on resolution timelines
    - Focus on both fixing the immediate issue and preventing recurrence
    - Sign off professionally but warmly
  `,
  
  "HR": `
    You are the Human Resources Department's AI response agent. Your goal is to craft helpful, accurate, and human-like responses to HR-related tickets.
    
    Consider these HR department guidelines:
    - Be empathetic and people-focused
    - Maintain strict confidentiality and privacy 
    - Reference specific company policies when appropriate
    - Provide clear timelines for HR processes
    - Use inclusive, respectful language
    - For benefits/time-off requests, be precise about procedures
    - Sign off warmly and professionally
  `,
  
  "Facilities": `
    You are the Facilities Department's AI response agent. Your goal is to craft helpful, accurate, and human-like responses to facilities-related tickets.
    
    Consider these Facilities department guidelines:
    - Be practical and solution-oriented
    - For maintenance requests, provide clear timelines
    - Reference building/location details accurately
    - For access-related requests, clearly explain security protocols
    - Provide relevant contact information when necessary
    - Acknowledge the impact of facilities issues on work environment
    - Sign off professionally but warmly
  `,
  
  "Admin": `
    You are the Admin Department's AI response agent. Your goal is to craft helpful, accurate, and human-like responses to administrative tickets.
    
    Consider these Admin department guidelines:
    - Be organized and thorough in your responses
    - For procurement requests, include clear process steps
    - Reference company procedures and policies when relevant
    - Provide realistic timelines for administrative processes
    - Use professional but approachable language
    - Include relevant forms or resources when needed
    - Sign off professionally but warmly
  `
};

// Format for all agent responses
const responseFormat = `
IMPORTANT: Respond with ONLY valid JSON in the following format:
{
  "response": "Your complete human-like response to the ticket",
  "confidence": number between 0-100 indicating your confidence in this response,
  "reasoning": "Brief explanation of your rationale for this response",
  "suggested_status": "open" | "in_progress" | "pending" | "resolved",
  "suggested_tags": ["tag1", "tag2"] (up to 3 relevant tags)
}
`;

// Validator agent prompt
const validatorPrompt = `
You are the Validator Agent for a help desk ticket system. Your job is to evaluate response quality before sending to users.

Evaluate responses based on:
1. Accuracy - Does it correctly address the ticket's issues?
2. Completeness - Does it fully address all aspects of the request?
3. Tone - Is it professional, empathetic and human-like?
4. Clarity - Is it easy to understand with clear next steps?
5. Specificity - Does it provide specific information rather than generic answers?

IMPORTANT: Respond with ONLY valid JSON in the following format:
{
  "isValid": boolean,
  "feedback": "Your specific feedback on the response",
  "improvedResponse": "Only include this field if isValid is false, providing an improved version"
}
`;

// Finds similar tickets to provide context to the agent
async function findSimilarTickets(ticket: TicketDetails, departmentName: string, limit: number = 3): Promise<SimilarTicket[]> {
  try {
    // Generate embedding for the current ticket
    const ticketEmbedding = await embeddingsService.generateOpenAIEmbedding(
      `${ticket.title} ${ticket.description}`
    );
    
    // Get department ID
    const { data: deptData } = await supabase
      .from('departments')
      .select('id')
      .eq('name', departmentName)
      .single();
    
    if (!deptData) {
      console.error(`Department not found: ${departmentName}`);
      return [];
    }
    
    // Find similar tickets from the same department
    // Since we don't have a ticket_responses table, we'll use the tickets table directly
    const { data: similarTickets } = await supabase
      .from('tickets')
      .select(`
        id,
        title,
        description,
        created_at,
        resolved_at,
        department_id,
        status
      `)
      .eq('department_id', deptData.id)
      .eq('status', 'resolved')  // Only consider resolved tickets for examples
      .limit(10);  // Get more than we need, we'll filter by similarity
    
    if (!similarTickets || similarTickets.length === 0) {
      return [];
    }
    
    // Calculate similarity scores and mock responses
    // In a real implementation, you would have a table with actual responses
    const ticketsWithSimilarity: SimilarTicket[] = await Promise.all(
      similarTickets.map(async (st) => {
        // Generate embedding for the similar ticket
        const similarTicketEmbedding = await embeddingsService.generateOpenAIEmbedding(
          `${st.title} ${st.description}`
        );
        
        // Calculate cosine similarity
        const similarity = cosineSimilarity(ticketEmbedding, similarTicketEmbedding);
        
        const resolutionTime = st.resolved_at ? 
          calculateResolutionTime(st.created_at, st.resolved_at) :
          'Not resolved';
        
        // Mock response since we don't have actual responses stored
        const mockResponse = `Thank you for your request regarding "${st.title}". We've resolved this issue and the solution involved [specific details would be here in a real implementation]. Please let us know if you need any further assistance.`;
        
        return {
          id: st.id,
          title: st.title,
          description: st.description,
          response: mockResponse,
          resolution_time: resolutionTime,
          similarity
        };
      })
    );
    
    // Sort by similarity and return top matches
    return ticketsWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  } catch (error) {
    console.error('Error finding similar tickets:', error);
    return [];
  }
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Helper function to calculate resolution time
function calculateResolutionTime(createdAt: string, resolvedAt: string): string {
  const created = new Date(createdAt).getTime();
  const resolved = new Date(resolvedAt).getTime();
  const diffHours = (resolved - created) / (1000 * 60 * 60);
  
  if (diffHours < 1) {
    return `${Math.round(diffHours * 60)} minutes`;
  } else if (diffHours < 24) {
    return `${Math.round(diffHours)} hours`;
  } else {
    return `${Math.round(diffHours / 24)} days`;
  }
}

// Function to generate response with department agent
async function generateDepartmentResponse(
  ticket: TicketDetails,
  departmentName: string,
  similarTickets: SimilarTicket[]
): Promise<AgentResponse> {
  try {
    console.log(`🔄 ${departmentName} agent generating response for ticket: ${ticket.ticket_number}`);
    
    // Get the appropriate department context
    const departmentContext = departmentContexts[departmentName as keyof typeof departmentContexts] || 
      "You are a help desk support agent. Generate a helpful and professional response.";
    
    // Format similar tickets as examples
    const similarTicketsText = similarTickets.length > 0 
      ? similarTickets.map(st => `
        Similar Ticket: "${st.title}"
        Description: "${st.description}"
        Response Used: "${st.response}"
        Resolution Time: ${st.resolution_time}
        Similarity Score: ${(st.similarity * 100).toFixed(1)}%
      `).join("\n\n")
      : "No similar tickets found for reference.";
    
    // Make OpenAI API call for response generation
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or another appropriate model
      messages: [
        { 
          role: "system", 
          content: `${departmentContext}\n\n${responseFormat}` 
        },
        {
          role: "user",
          content: `Generate a response to this help desk ticket:

Ticket Number: ${ticket.ticket_number}
Title: ${ticket.title}
Description: ${ticket.description}
Category: ${ticket.category?.name || "Uncategorized"}
Priority: ${ticket.priority}
Requester: ${ticket.requester?.name || "Unknown"}
Current Status: ${ticket.status}

${similarTicketsText}

Based on this information, generate a professional, helpful, and human-like response.
Remember to follow the ${departmentName} department guidelines.
Return ONLY a valid JSON object with your response.`
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }, // Ensure JSON response
    });

    const content = response.choices[0].message.content;
    
    try {
      // Parse the response
      const parsedResponse = JSON.parse(content);
      return {
        response: parsedResponse.response,
        confidence: parsedResponse.confidence,
        reasoning: parsedResponse.reasoning,
        suggested_status: parsedResponse.suggested_status,
        suggested_tags: parsedResponse.suggested_tags
      };
    } catch (e) {
      console.error(`Failed to parse response from ${departmentName} agent:`, e);
      throw new Error(`Invalid response format from ${departmentName} agent`);
    }
  } catch (error) {
    console.error(`Error with ${departmentName} agent:`, error);
    throw error;
  }
}

// Function to validate generated response
async function validateResponse(
  ticket: TicketDetails,
  generatedResponse: AgentResponse
): Promise<ValidationResult> {
  try {
    console.log(`🔄 Validator agent evaluating response for ticket: ${ticket.ticket_number}`);
    
    // Make OpenAI API call for validation
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or another appropriate model
      messages: [
        { 
          role: "system", 
          content: validatorPrompt 
        },
        {
          role: "user",
          content: `Validate this response to a help desk ticket:

Ticket Information:
Title: ${ticket.title}
Description: ${ticket.description}
Priority: ${ticket.priority}
Status: ${ticket.status}

Generated Response:
${generatedResponse.response}

Agent Confidence: ${generatedResponse.confidence}%
Agent Reasoning: ${generatedResponse.reasoning}

Evaluate if this response is valid and high quality. Return only a JSON object.`
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }, // Ensure JSON response
    });

    const content = response.choices[0].message.content;
    
    try {
      // Parse the validation result
      const validationResult = JSON.parse(content);
      return {
        isValid: validationResult.isValid,
        feedback: validationResult.feedback,
        improvedResponse: validationResult.improvedResponse
      };
    } catch (e) {
      console.error('Failed to parse validator response:', e);
      // Default to valid if parsing fails, but log the error
      return { isValid: true, feedback: "Error parsing validation response" };
    }
  } catch (error) {
    console.error('Error with validator agent:', error);
    // Default to valid if API call fails, but log the error
    return { isValid: true, feedback: "Error during validation" };
  }
}

// Main orchestrator function that manages the entire workflow
export async function generateSmartResponse(ticket: TicketDetails, maxAttempts: number = 3): Promise<AgentResponse> {
  console.log(`🔄 Starting smart response generation for ticket: ${ticket.ticket_number}`);
  
  // Get the department name
  const departmentName = ticket.department?.name || "IT Support"; // Default to IT if no department
  
  try {
    // Find similar tickets for context
    const similarTickets = await findSimilarTickets(ticket, departmentName);
    console.log(`Found ${similarTickets.length} similar tickets for context`);
    
    let attempts = 0;
    let validResponse: AgentResponse | null = null;
    
    // Try to generate a valid response, up to maxAttempts
    while (attempts < maxAttempts && !validResponse) {
      attempts++;
      console.log(`Response generation attempt ${attempts}/${maxAttempts}`);
      
      try {
        // Generate response with department-specific agent
        const generatedResponse = await generateDepartmentResponse(ticket, departmentName, similarTickets);
        
        // Validate the response
        const validation = await validateResponse(ticket, generatedResponse);
        
        if (validation.isValid) {
          // If valid, use this response
          validResponse = generatedResponse;
          console.log('✅ Valid response generated');
        } else {
          // If not valid and we have an improved response, use that for the next validation
          console.log(`❌ Invalid response. Feedback: ${validation.feedback}`);
          
          if (validation.improvedResponse && attempts < maxAttempts) {
            // Use the improved response as our next attempt
            validResponse = {
              ...generatedResponse,
              response: validation.improvedResponse,
              confidence: Math.min(generatedResponse.confidence + 10, 100) // Increase confidence slightly
            };
            console.log('⚠️ Using improved response from validator');
            break; // Exit the loop with the improved response
          }
        }
      } catch (error) {
        console.error(`Error in attempt ${attempts}:`, error);
      }
    }
    
    // If we couldn't generate a valid response after all attempts, return a fallback
    if (!validResponse) {
      console.warn('⚠️ Failed to generate valid response after all attempts, using fallback');
      return {
        response: `Hi ${ticket.requester?.name || 'there'},\n\nThank you for your ticket. We've received your request and are looking into it. A support agent will get back to you shortly with more information.\n\nRegards,\nHelp Desk Team`,
        confidence: 50,
        reasoning: "Fallback response after failed generation attempts",
        suggested_status: "in_progress",
        suggested_tags: ["needs-review"]
      };
    }
    
    return validResponse;
  } catch (error) {
    console.error('Critical error in smart response generation:', error);
    
    // Return a safe fallback response
    return {
      response: `Hi ${ticket.requester?.name || 'there'},\n\nThank you for your ticket. We've received your request and are looking into it. A support agent will get back to you shortly with more information.\n\nRegards,\nHelp Desk Team`,
      confidence: 30,
      reasoning: "Error fallback response",
      suggested_status: "open",
      suggested_tags: ["error", "needs-review"]
    };
  }
}

export const responseAgentService = {
  generateSmartResponse
}; 