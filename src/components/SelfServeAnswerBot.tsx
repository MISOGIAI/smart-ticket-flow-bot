import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, MessageSquare, Search, Lightbulb, ExternalLink, Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { KnowledgeBaseService, SearchResult } from '@/lib/knowledge-base-service';
import { SelfServeStatsService } from '@/lib/self-serve-stats-service';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface Answer {
  content: string;
  sourceName: string;
  sourceUrl?: string;
  confidence: number;
  articleId?: string;
}

const SelfServeAnswerBot: React.FC = () => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>([
    "How do I reset my password?",
    "Where can I find the company VPN settings?",
    "What's the process for requesting new software?"
  ]);

  const knowledgeService = new KnowledgeBaseService();
  const statsService = new SelfServeStatsService();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    // Add to recent queries
    if (!recentQueries.includes(query)) {
      setRecentQueries([query, ...recentQueries.slice(0, 4)]);
    }
    
    try {
      // Search knowledge base
      const { results, error } = await knowledgeService.searchKnowledgeBase(query);
      
      if (error) {
        throw error;
      }
      
      if (results.length > 0) {
        const bestMatch = results[0];
        
        // Calculate confidence based on relevance score
        // Assuming relevance of 100+ is very high confidence
        const confidence = Math.min(Math.round(bestMatch.relevance), 100);
        
        // Increment view count for the article
        await knowledgeService.incrementViewCount(bestMatch.article.id);
        
        setAnswer({
          content: bestMatch.article.content,
          sourceName: bestMatch.article.title,
          sourceUrl: `/knowledge-base/article/${bestMatch.article.id}`,
          confidence: confidence,
          articleId: bestMatch.article.id
        });
        
        // Track successful query
        await statsService.trackQuery({
          query: query,
          was_successful: true,
          confidence_score: confidence,
          user_id: user?.id
        });
      } else {
        // No results found
        setAnswer({
          content: "I couldn't find a specific answer to your question in our knowledge base. Please try rephrasing your question or create a support ticket for personalized assistance.",
          sourceName: "No specific source found",
          confidence: 0
        });
        
        // Track failed query
        await statsService.trackQuery({
          query: query,
          was_successful: false,
          user_id: user?.id
        });
      }
    } catch (err) {
      console.error("Error searching knowledge base:", err);
      toast({
        title: "Error",
        description: "There was an error searching the knowledge base. Please try again.",
        variant: "destructive"
      });
      
      setAnswer({
        content: "Sorry, there was an error processing your request. Please try again later.",
        sourceName: "Error",
        confidence: 0
      });
      
      // Track failed query
      await statsService.trackQuery({
        query: query,
        was_successful: false,
        user_id: user?.id
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-100 text-green-800";
    if (confidence >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const handleFeedback = async (isPositive: boolean) => {
    if (answer) {
      // Record feedback for the article if it exists
      if (answer.articleId) {
        await knowledgeService.recordFeedback(answer.articleId, isPositive);
      }
      
      // Track feedback for stats
      await statsService.trackFeedback({
        query: query,
        was_helpful: isPositive,
        article_id: answer.articleId,
        user_id: user?.id
      });
    }
    
    toast({
      title: isPositive ? "Feedback Received" : "We'll Improve",
      description: isPositive 
        ? "Thank you for your positive feedback!" 
        : "Thanks for letting us know. We'll use this to improve our answers.",
      duration: 3000
    });
  };

  const handleCreateTicket = async () => {
    // Track ticket creation
    if (query) {
      await statsService.trackTicketCreation({
        query: query,
        user_id: user?.id
      });
    }
    
    toast({
      title: "Creating Support Ticket",
      description: "Redirecting you to create a ticket with your query pre-filled.",
      duration: 3000
    });
    
    // In a real implementation, this would redirect to ticket creation with context
    // For now, navigate to the main page with a query parameter
    navigate('/?createTicket=true&query=' + encodeURIComponent(query));
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          <CardTitle>Self-Serve Answer Bot</CardTitle>
        </div>
        <CardDescription>
          Get instant answers from our knowledge base without creating a ticket
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Type your question here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !query.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </div>
        
        {/* Recent Queries */}
        <div className="pt-2">
          <p className="text-sm text-gray-500 mb-2">Recent searches:</p>
          <div className="flex flex-wrap gap-2">
            {recentQueries.map((recentQuery, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setQuery(recentQuery)}
              >
                {recentQuery}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Answer Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
            <p className="text-gray-600">Searching knowledge base...</p>
          </div>
        ) : answer ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Answer</h3>
              <Badge className={getConfidenceColor(answer.confidence)}>
                {answer.confidence}% Confidence
              </Badge>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="prose prose-blue max-w-none whitespace-pre-wrap">
                {answer.content}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-gray-600">
                <span>Source:</span>
                <span className="font-medium">{answer.sourceName}</span>
                {answer.sourceUrl && (
                  <a href={answer.sourceUrl} className="inline-flex items-center text-blue-600 hover:underline">
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleFeedback(true)}
                  className="text-green-600 hover:bg-green-50"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleFeedback(false)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Not Helpful
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="pt-2">
              <p className="text-sm text-gray-600 mb-2">
                Still need help? Create a support ticket and we'll connect you with an agent.
              </p>
              <Button 
                variant="outline" 
                onClick={handleCreateTicket}
                className="w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Create Support Ticket
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
      
      <CardFooter className="flex justify-between text-xs text-gray-500 pt-2">
        <span>Powered by AI</span>
        <span>Answers based on internal documentation</span>
      </CardFooter>
    </Card>
  );
};

export default SelfServeAnswerBot; 