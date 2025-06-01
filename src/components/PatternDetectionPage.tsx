import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Sparkles, Activity, BarChart3, RefreshCw, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { patternDetectionService, PatternAnalysisResult, Ticket } from '@/lib/pattern-detection-service';
import { supabase } from '@/integrations/supabase/client';
import { DEPARTMENT_IDS, getDepartmentNameById } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';

const PatternDetectionPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PatternAnalysisResult | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketTimeframe, setTicketTimeframe] = useState<'7days' | '30days' | '90days'>('30days');
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Load tickets based on the agent's department
  useEffect(() => {
    if (!userProfile?.department_id) return;
    
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        // Calculate date range based on selected timeframe
        const now = new Date();
        let startDate = new Date();
        
        if (ticketTimeframe === '7days') {
          startDate.setDate(now.getDate() - 7);
        } else if (ticketTimeframe === '30days') {
          startDate.setDate(now.getDate() - 30);
        } else {
          startDate.setDate(now.getDate() - 90);
        }
        
        const { data, error } = await supabase
          .from('tickets')
          .select(`
            id,
            title,
            description,
            status,
            priority,
            department_id,
            created_at
          `)
          .eq('department_id', userProfile.department_id)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setTickets(data || []);
        toast({
          title: "Tickets Loaded",
          description: `${data?.length || 0} tickets loaded for analysis.`,
        });
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast({
          title: "Error",
          description: "Failed to load tickets. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [userProfile?.department_id, ticketTimeframe, toast]);

  const handleRunAnalysis = async () => {
    if (tickets.length === 0) {
      toast({
        title: "No Tickets",
        description: "There are no tickets available for analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await patternDetectionService.analyzeTickets(tickets);
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: "Pattern detection analysis has been completed successfully.",
      });
    } catch (error) {
      console.error('Error during analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to complete the pattern analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is a support agent
  if (userProfile?.role !== 'support_agent' && userProfile?.role !== 'manager') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            Pattern detection is only available to support agents and managers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unauthorized</AlertTitle>
            <AlertDescription>
              You do not have permission to access this feature.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate('/')} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const departmentName = userProfile?.department_id 
    ? getDepartmentNameById(userProfile.department_id)
    : 'Unknown Department';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/')} variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Pattern Detection</h2>
            <p className="text-muted-foreground">
              AI-powered analysis of ticket patterns for {departmentName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Tabs 
            value={ticketTimeframe} 
            onValueChange={(v) => setTicketTimeframe(v as '7days' | '30days' | '90days')}
            className="w-[400px]"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
              <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
              <TabsTrigger value="90days">Last 90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            onClick={handleRunAnalysis} 
            disabled={isLoading || tickets.length === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Tickets
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">
              Tickets available for pattern analysis
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Department
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentName}</div>
            <p className="text-xs text-muted-foreground">
              Currently viewing patterns for this department
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Analysis Status
            </CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysisResult ? "Complete" : "Not Started"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analysisResult 
                ? `Last analysis: ${new Date().toLocaleString()}`
                : "Click 'Run Analysis' to start"}
            </p>
          </CardContent>
        </Card>
      </div>

      {analysisResult ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Macro Summary</CardTitle>
              <CardDescription>
                Overall analysis of ticket patterns in {analysisResult.departmentName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {analysisResult.macroSummary}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className={analysisResult.repetitivePatterns.is_detected ? "border-amber-400" : "border-green-400"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Repetitive Work Patterns</CardTitle>
                  {analysisResult.repetitivePatterns.is_detected ? (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      Patterns Detected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                      No Patterns
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Detection of work that could be automated or optimized
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant={analysisResult.repetitivePatterns.is_detected ? "default" : "default"}>
                  {analysisResult.repetitivePatterns.is_detected ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {analysisResult.repetitivePatterns.is_detected 
                      ? "Opportunities for Improvement" 
                      : "No Repetitive Patterns"}
                  </AlertTitle>
                  <AlertDescription>
                    {analysisResult.repetitivePatterns.rationale}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card className={analysisResult.misusePatterns.is_detected ? "border-red-400" : "border-green-400"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Misuse Patterns</CardTitle>
                  {analysisResult.misusePatterns.is_detected ? (
                    <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                      Issues Detected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                      No Issues
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Detection of potential system misuse or security concerns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant={analysisResult.misusePatterns.is_detected ? "destructive" : "default"}>
                  {analysisResult.misusePatterns.is_detected ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {analysisResult.misusePatterns.is_detected 
                      ? "Potential Issues Detected" 
                      : "No Misuse Detected"}
                  </AlertTitle>
                  <AlertDescription>
                    {analysisResult.misusePatterns.rationale}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Micro-Summaries</CardTitle>
              <CardDescription>
                Individual ticket summaries used for the analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.microSummaries.map((summary, index) => (
                  <li key={index} className="bg-gray-50 p-3 rounded-md">
                    <span className="text-sm font-medium text-gray-900">{summary}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="text-sm text-gray-500">
              {analysisResult.microSummaries.length} tickets analyzed
            </CardFooter>
          </Card>
          
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      ) : tickets.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Ready for Analysis</CardTitle>
              <CardDescription>
                {tickets.length} tickets are ready to be analyzed. Click "Run Analysis" to start.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6">
                <Sparkles className="h-12 w-12 text-blue-500 mb-4" />
                <p className="text-center text-gray-600">
                  The AI-powered pattern detection will analyze tickets in the {departmentName} department 
                  to identify repetitive work patterns and potential misuse.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </>
      ) : isLoading ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Loading Tickets</CardTitle>
              <CardDescription>
                Please wait while we load tickets for analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-center text-gray-600">
                  Loading tickets from the {departmentName} department...
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>No Tickets Available</CardTitle>
              <CardDescription>
                There are no tickets available for analysis in the selected timeframe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Data</AlertTitle>
                <AlertDescription>
                  Try selecting a different timeframe or check if there are tickets assigned to your department.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PatternDetectionPage; 