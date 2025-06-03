import { supabase } from '@/integrations/supabase/client';

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  view_count: number;
  helpful_votes: number;
  unhelpful_votes: number;
}

export interface SearchResult {
  article: KnowledgeArticle;
  relevance: number;
}

export class KnowledgeBaseService {
  /**
   * Search the knowledge base for articles matching the query
   */
  async searchKnowledgeBase(query: string): Promise<{ results: SearchResult[]; error: Error | null }> {
    try {
      // In a real implementation, this would use vector search or full-text search
      // For now, we'll simulate a search with mock data
      
      const mockArticles: KnowledgeArticle[] = [
        {
          id: '1',
          title: 'How to Reset Your Password',
          content: 'To reset your password, please follow these steps:\n\n1. Go to the login page\n2. Click on "Forgot Password"\n3. Enter your email address\n4. Check your inbox for reset instructions\n5. Follow the link in the email to create a new password\n\nIf you don\'t receive the email within 5 minutes, please check your spam folder or contact the IT helpdesk.',
          category: 'Account Management',
          tags: ['password', 'reset', 'login', 'account'],
          created_at: '2023-05-15T10:30:00Z',
          updated_at: '2023-08-20T14:45:00Z',
          view_count: 1250,
          helpful_votes: 320,
          unhelpful_votes: 12
        },
        {
          id: '2',
          title: 'VPN Setup Instructions',
          content: 'Our company uses Cisco AnyConnect VPN. To set it up:\n\n1. Download Cisco AnyConnect from the company software portal\n2. Install the application\n3. Enter vpn.companyname.com as the server address\n4. Use your regular company credentials to log in\n\nFor detailed instructions with screenshots, please refer to the IT Knowledge Base.',
          category: 'Remote Work',
          tags: ['vpn', 'remote', 'cisco', 'anyconnect', 'network'],
          created_at: '2023-03-10T09:15:00Z',
          updated_at: '2023-09-05T11:20:00Z',
          view_count: 980,
          helpful_votes: 245,
          unhelpful_votes: 8
        },
        {
          id: '3',
          title: 'Software Request Process',
          content: 'To request new software:\n\n1. Navigate to the IT Service Portal\n2. Select "Software Request" from the service catalog\n3. Fill out the request form with details about the software needed\n4. Your manager will receive an approval notification\n5. Once approved, IT will contact you about installation\n\nNote that all software requests must comply with our licensing and security policies.',
          category: 'IT Services',
          tags: ['software', 'request', 'installation', 'procurement', 'license'],
          created_at: '2023-02-22T13:45:00Z',
          updated_at: '2023-07-18T10:30:00Z',
          view_count: 750,
          helpful_votes: 180,
          unhelpful_votes: 15
        },
        {
          id: '4',
          title: 'Email Signature Setup',
          content: 'To set up your company email signature:\n\n1. Go to Settings in your email client\n2. Navigate to Signatures section\n3. Click "Create New"\n4. Copy the template from the brand portal\n5. Replace the placeholders with your information\n6. Save the signature and set it as default for new emails\n\nMake sure to include your full name, title, department, and contact information.',
          category: 'Communication',
          tags: ['email', 'signature', 'branding', 'outlook', 'gmail'],
          created_at: '2023-04-05T15:20:00Z',
          updated_at: '2023-06-12T09:45:00Z',
          view_count: 620,
          helpful_votes: 150,
          unhelpful_votes: 5
        },
        {
          id: '5',
          title: 'Expense Report Submission',
          content: 'To submit an expense report:\n\n1. Log in to the expense management system\n2. Click "New Report"\n3. Enter report name and business purpose\n4. Add individual expenses with receipts\n5. Select the appropriate cost center and category\n6. Submit for approval\n\nExpense reports must be submitted within 30 days of incurring the expense. Original receipts must be kept for 90 days after submission.',
          category: 'Finance',
          tags: ['expenses', 'reimbursement', 'finance', 'receipts', 'reports'],
          created_at: '2023-01-18T11:30:00Z',
          updated_at: '2023-08-30T14:15:00Z',
          view_count: 890,
          helpful_votes: 210,
          unhelpful_votes: 18
        }
      ];
      
      // Simple keyword matching for demo purposes
      const lowerQuery = query.toLowerCase();
      const results: SearchResult[] = mockArticles
        .map(article => {
          // Calculate relevance based on keyword matches in title, content, and tags
          let relevance = 0;
          
          // Check title
          if (article.title.toLowerCase().includes(lowerQuery)) {
            relevance += 50;
          }
          
          // Check content
          if (article.content.toLowerCase().includes(lowerQuery)) {
            relevance += 30;
          }
          
          // Check tags
          const matchingTags = article.tags.filter(tag => 
            tag.toLowerCase().includes(lowerQuery) || lowerQuery.includes(tag.toLowerCase())
          );
          relevance += matchingTags.length * 20;
          
          return { article, relevance };
        })
        .filter(result => result.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance);
      
      return { results, error: null };
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return { results: [], error: error as Error };
    }
  }

  /**
   * Record user feedback on an article
   */
  async recordFeedback(articleId: string, isHelpful: boolean): Promise<{ success: boolean; error: Error | null }> {
    try {
      // In a real implementation, this would update the article's feedback count in the database
      console.log(`Recorded feedback for article ${articleId}: ${isHelpful ? 'helpful' : 'not helpful'}`);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error recording feedback:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Increment the view count for an article
   */
  async incrementViewCount(articleId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      // In a real implementation, this would update the article's view count in the database
      console.log(`Incremented view count for article ${articleId}`);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error incrementing view count:', error);
      return { success: false, error: error as Error };
    }
  }
} 