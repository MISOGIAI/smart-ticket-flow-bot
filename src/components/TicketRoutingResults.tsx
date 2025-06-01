import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle, Tag, Compass } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { supabase } from '@/integrations/supabase/client';

interface RoutingResultsProps {
  routingResults: {
    ticket: any;
    department_evaluations: any[];
    routing_decision: {
      assigned_department: string;
      department_id: string;
      reason: string;
      confidence: number;
      priority: string;
      tags: string[];
      estimated_resolution_time: string;
    };
  };
  onAccept: (departmentId: string) => void;
  onReject: () => void;
  isLoading?: boolean;
}

const TicketRoutingResults: React.FC<RoutingResultsProps> = ({ 
  routingResults, 
  onAccept,
  onReject,
  isLoading = false 
}) => {
  const [departmentMap, setDepartmentMap] = useState<{[key: string]: string}>({});
  
  // Fetch departments when component mounts
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id, name');
        
        if (error) {
          console.error('Error fetching departments:', error);
          return;
        }
        
        // Create mapping from name to id
        const deptMap: {[key: string]: string} = {};
        data.forEach(dept => {
          deptMap[dept.name] = dept.id;
        });
        
        setDepartmentMap(deptMap);
        console.log('Department mapping created:', deptMap);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };
    
    fetchDepartments();
  }, []);
  
  // Handle accept routing with proper UUID mapping
  const handleAcceptRecommendation = () => {
    if (!routingResults) return;
    
    const { assigned_department, department_id } = routingResults.routing_decision;
    
    // Try to get department ID from our map first
    let validDepartmentId = departmentMap[assigned_department];
    
    // If not found in map, use the provided department_id if it looks like a UUID
    if (!validDepartmentId) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(department_id);
      if (isUUID) {
        validDepartmentId = department_id;
      } else {
        console.warn(`Could not find valid UUID for department: ${assigned_department}`);
      }
    }
    
    if (validDepartmentId) {
      console.log(`Accepting routing for department ${assigned_department} with UUID: ${validDepartmentId}`);
      onAccept(validDepartmentId);
    } else {
      console.error(`No valid UUID found for department: ${assigned_department}`);
      alert(`Could not find a valid department ID for ${assigned_department}. Please try again later.`);
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>AI Routing Analysis</CardTitle>
          <CardDescription>Our AI is analyzing the best department to route this ticket to...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-lg font-medium">Processing Ticket</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments...</p>
            <Progress className="mt-6 w-full" value={70} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!routingResults) {
    return null;
  }

  const { routing_decision, department_evaluations } = routingResults;
  
  // Normalize priority to valid values
  const normalizePriority = (priority: string): string => {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const normalized = priority?.toLowerCase() || 'medium';
    return validPriorities.includes(normalized) ? normalized : 'medium';
  };
  
  // Ensure routing_decision has all required fields with defaults
  const safeRoutingDecision = {
    assigned_department: routing_decision.assigned_department || 'Unknown Department',
    department_id: routing_decision.department_id || '0',
    reason: routing_decision.reason || 'No reason provided',
    confidence: routing_decision.confidence || 0,
    priority: normalizePriority(routing_decision.priority),
    tags: Array.isArray(routing_decision.tags) ? routing_decision.tags : ['auto-routed'],
    estimated_resolution_time: routing_decision.estimated_resolution_time || 'Unknown'
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-blue-600';
    if (confidence >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-blue-600" />
          AI Routing Recommendation
        </CardTitle>
        <CardDescription>
          Our AI has analyzed this ticket and determined the best department for resolution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main recommendation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-medium">Recommended Department</h3>
              <p className="text-2xl font-bold text-blue-700">{safeRoutingDecision.assigned_department}</p>
            </div>
            <Badge className={getConfidenceColor(safeRoutingDecision.confidence)}>
              {safeRoutingDecision.confidence}% Confidence
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(safeRoutingDecision.priority)}>
                {safeRoutingDecision.priority} Priority
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {safeRoutingDecision.estimated_resolution_time}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {safeRoutingDecision.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="mt-3 text-sm">
            <p className="font-medium text-gray-800">Reason:</p>
            <p className="text-gray-700">{safeRoutingDecision.reason}</p>
          </div>
        </div>

        {/* Department evaluations */}
        <div>
          <h3 className="font-medium mb-3">Department Assessments</h3>
          <div className="space-y-3">
            {department_evaluations.map((dept, index) => (
              <div key={index} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{dept.department_name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-600">
                      Interest: {dept.interest_level}%
                    </Badge>
                    <Badge variant="outline" className="text-purple-600">
                      Confidence: {dept.confidence_score}%
                    </Badge>
                  </div>
                </div>
                <Progress 
                  className="h-2 my-2" 
                  value={(dept.interest_level + dept.confidence_score) / 2} 
                />
                <p className="text-sm text-gray-600 mt-2">{dept.rationale}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dept.recommended_tags.map((tag: string, tagIndex: number) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            onClick={onReject}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Reject Recommendation
          </Button>
          <Button
            onClick={handleAcceptRecommendation}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4" />
            Accept Recommendation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketRoutingResults; 