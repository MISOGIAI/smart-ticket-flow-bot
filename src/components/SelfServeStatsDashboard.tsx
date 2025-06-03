import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, ThumbsUp, ThumbsDown, Search, MessageSquare, Lightbulb, Zap } from 'lucide-react';
import { SelfServeStatsService, SelfServeStats } from '@/lib/self-serve-stats-service';

const SelfServeStatsDashboard: React.FC = () => {
  const [stats, setStats] = useState<SelfServeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const statsService = new SelfServeStatsService();
  
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const { stats, error } = await statsService.getStats();
        if (error) {
          throw error;
        }
        setStats(stats);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-600">Loading statistics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!stats) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-gray-600">No statistics available yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="queries" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Popular Queries</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center space-x-2">
            <ThumbsUp className="h-4 w-4" />
            <span>Feedback</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Search className="h-5 w-5 mr-2 text-blue-600" />
                  Query Success Rate
                </CardTitle>
                <CardDescription>
                  Percentage of queries that returned relevant results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span className="font-medium">
                      {stats.total_queries > 0 
                        ? Math.round((stats.successful_queries / stats.total_queries) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={stats.total_queries > 0 
                      ? (stats.successful_queries / stats.total_queries) * 100 
                      : 0} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 pt-1">
                    <span>Total Queries: {stats.total_queries}</span>
                    <span>Successful: {stats.successful_queries}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
                  Ticket Creation Rate
                </CardTitle>
                <CardDescription>
                  Percentage of queries that resulted in ticket creation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ticket Creation</span>
                    <span className="font-medium">
                      {Math.round(stats.ticket_creation_rate)}%
                    </span>
                  </div>
                  <Progress 
                    value={stats.ticket_creation_rate} 
                    className="h-2"
                  />
                  <div className="pt-1 text-xs text-gray-500">
                    <p>Lower is better - indicates self-serve success</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                  Average Confidence
                </CardTitle>
                <CardDescription>
                  Average confidence score of answers provided
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Confidence Score</span>
                    <span className="font-medium">
                      {Math.round(stats.average_confidence)}%
                    </span>
                  </div>
                  <Progress 
                    value={stats.average_confidence} 
                    className="h-2"
                  />
                  <div className="pt-1 text-xs text-gray-500">
                    <p>Higher is better - indicates answer quality</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ThumbsUp className="h-5 w-5 mr-2 text-green-600" />
                  Feedback Sentiment
                </CardTitle>
                <CardDescription>
                  Positive vs negative feedback from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-2 text-green-600" />
                      <span>Positive</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50">
                      {stats.positive_feedback}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ThumbsDown className="h-4 w-4 mr-2 text-red-600" />
                      <span>Negative</span>
                    </div>
                    <Badge variant="outline" className="bg-red-50">
                      {stats.negative_feedback}
                    </Badge>
                  </div>
                  <Progress 
                    value={stats.positive_feedback + stats.negative_feedback > 0 
                      ? (stats.positive_feedback / (stats.positive_feedback + stats.negative_feedback)) * 100 
                      : 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="queries" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Search className="h-5 w-5 mr-2 text-blue-600" />
                Most Common Queries
              </CardTitle>
              <CardDescription>
                The most frequently searched questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.most_common_queries.length > 0 ? (
                <div className="space-y-4">
                  {stats.most_common_queries.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.query}</p>
                        <Progress 
                          value={stats.most_common_queries[0].count > 0 
                            ? (item.count / stats.most_common_queries[0].count) * 100 
                            : 0} 
                          className="h-1 mt-2"
                        />
                      </div>
                      <Badge className="ml-4 bg-blue-50 text-blue-800 hover:bg-blue-100">
                        {item.count} {item.count === 1 ? 'search' : 'searches'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No query data available yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ThumbsUp className="h-5 w-5 mr-2 text-green-600" />
                Feedback Analysis
              </CardTitle>
              <CardDescription>
                User feedback on self-serve answers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 bg-green-50 rounded-lg p-4 text-center">
                    <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-700">{stats.positive_feedback}</p>
                    <p className="text-sm text-green-600">Helpful Responses</p>
                  </div>
                  
                  <div className="flex-1 bg-red-50 rounded-lg p-4 text-center">
                    <ThumbsDown className="h-8 w-8 mx-auto mb-2 text-red-600" />
                    <p className="text-2xl font-bold text-red-700">{stats.negative_feedback}</p>
                    <p className="text-sm text-red-600">Unhelpful Responses</p>
                  </div>
                  
                  <div className="flex-1 bg-blue-50 rounded-lg p-4 text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-700">
                      {Math.round(stats.ticket_creation_rate)}%
                    </p>
                    <p className="text-sm text-blue-600">Created Tickets</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Satisfaction Rate</h3>
                  <div className="space-y-2">
                    <Progress 
                      value={stats.positive_feedback + stats.negative_feedback > 0 
                        ? (stats.positive_feedback / (stats.positive_feedback + stats.negative_feedback)) * 100 
                        : 0} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {stats.positive_feedback + stats.negative_feedback > 0 
                          ? Math.round((stats.positive_feedback / (stats.positive_feedback + stats.negative_feedback)) * 100) 
                          : 0}% Satisfaction
                      </span>
                      <span>
                        Total Feedback: {stats.positive_feedback + stats.negative_feedback}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SelfServeStatsDashboard; 