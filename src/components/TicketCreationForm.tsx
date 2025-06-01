import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Upload, X, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import TicketRoutingResults from './TicketRoutingResults';
import { ticketRoutingService } from '@/lib/ticket-routing-service';
import { DEPARTMENT_IDS, getDepartmentNameById, isValidDepartmentId } from '@/lib/constants';

interface TicketCreationFormProps {
  currentUser: any;
  onTicketCreated: () => void;
  onCancel: () => void;
}

const TicketCreationForm: React.FC<TicketCreationFormProps> = ({ 
  currentUser, 
  onTicketCreated, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    attachments: [] as File[]
  });
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Array<{id: string, name: string, department_id: string}>>([]);
  const [departments, setDepartments] = useState<Array<{id: string, name: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [routingResults, setRoutingResults] = useState<any>(null);
  const [isRoutingTicket, setIsRoutingTicket] = useState(false);
  const { toast } = useToast();

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResult, departmentsResult] = await Promise.all([
          supabase.from('categories').select('id, name, department_id'),
          supabase.from('departments').select('id, name')
        ]);

        if (categoriesResult.error) {
          console.error('Error fetching categories:', categoriesResult.error);
        } else {
          setCategories(categoriesResult.data || []);
        }

        if (departmentsResult.error) {
          console.error('Error fetching departments:', departmentsResult.error);
        } else {
          setDepartments(departmentsResult.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load categories and departments",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const generateAISuggestions = (text: string) => {
    const suggestions = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('password') || lowerText.includes('login')) {
      suggestions.push('Check our Password Reset Guide before submitting');
      suggestions.push('This will be automatically routed to IT Support');
    }
    if (lowerText.includes('software') || lowerText.includes('install')) {
      suggestions.push('Software requests typically take 2-3 business days');
      suggestions.push('Include specific version requirements if any');
    }
    if (lowerText.includes('leave') || lowerText.includes('vacation')) {
      suggestions.push('HR policies are available in the knowledge base');
      suggestions.push('This will be routed to HR department');
    }
    if (lowerText.includes('urgent') || lowerText.includes('asap')) {
      suggestions.push('Consider setting priority to High or Critical');
    }

    setAiSuggestions(suggestions);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'title' || field === 'description') {
      generateAISuggestions(value);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ 
      ...prev, 
      attachments: [...prev.attachments, ...files] 
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsRoutingTicket(true);
    setRoutingResults(null);

    try {
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      if (!selectedCategory) {
        throw new Error('Invalid category selected');
      }

      const ticketNumber = `TK-${Date.now().toString().slice(-6)}`;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .limit(1)
        .maybeSingle();

      if (userError) {
        console.error('User profile error:', userError);
        throw new Error('Failed to fetch user profile');
      }

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          title: formData.title,
          description: formData.description,
          category_id: selectedCategory.id,
          category_name: selectedCategory.name,
          department_id: selectedCategory.department_id,
          priority: formData.priority,
          requester_id: userProfile.id,
          ticket_number: ticketNumber,
          status: 'open'
        })
        .select()
        .single();

      if (ticketError) {
        console.error('Database error:', ticketError);
        throw new Error(`Failed to create ticket: ${ticketError.message}`);
      }

      console.log('Ticket created successfully:', ticket);

      const { data: requesterData } = await supabase
        .from('users')
        .select('name, department_id, job_title')
        .eq('id', userProfile.id)
        .single();

      const { data: categoryData } = await supabase
        .from('categories')
        .select('name')
        .eq('id', selectedCategory.id)
        .single();

      const { data: departmentData } = await supabase
        .from('departments')
        .select('name')
        .eq('id', selectedCategory.department_id)
        .single();

      const ticketWithRelations = {
        ...ticket,
        requester: {
          name: requesterData?.name || '',
          department_id: requesterData?.department_id || null,
          job_title: requesterData?.job_title || null
        },
        category: {
          name: categoryData?.name || ''
        },
        department: {
          name: departmentData?.name || ''
        },
        assigned_agent: null
      };

      const routingResult = await ticketRoutingService.routeTicket(ticketWithRelations);
      console.log('AI routing result:', routingResult);
      
      setRoutingResults(routingResult);
      setIsSubmitting(false);
      
      toast({
        title: "Ticket Created",
        description: `Ticket ${ticketNumber} has been created. Please review the AI routing recommendation.`,
      });
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      setIsRoutingTicket(false);
    }
  };

  const handleAcceptRouting = async (departmentId: string) => {
    try {
      if (!routingResults || !routingResults.ticket) {
        throw new Error('Routing results not available');
      }

      console.log('Accepting routing recommendation for department:', departmentId);
      
      // Validate department ID against our hardcoded mapping
      if (!isValidDepartmentId(departmentId)) {
        console.warn(`⚠️ Invalid department ID: ${departmentId}. Mapping to known department...`);
        
        // Try to get the department ID from the name if available
        if (routingResults.routing_decision?.assigned_department) {
          const deptName = routingResults.routing_decision.assigned_department;
          const knownDeptId = DEPARTMENT_IDS[deptName as keyof typeof DEPARTMENT_IDS];
          
          if (knownDeptId) {
            console.log(`✅ Found valid department ID for ${deptName}: ${knownDeptId}`);
            departmentId = knownDeptId;
          } else {
            console.warn(`⚠️ Could not map ${deptName} to a known department ID`);
          }
        }
      }
      
      // Validate that we have a UUID for department_id
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(departmentId);
      if (!isUUID) {
        throw new Error(`Invalid department ID format: ${departmentId}`);
      }
      
      // Validate priority value from AI routing
      let priority = routingResults.ticket.priority; // Default to current ticket priority
      
      // Get AI-suggested priority if available
      if (routingResults.routing_decision?.priority) {
        const suggestedPriority = routingResults.routing_decision.priority.toLowerCase();
        // Check if the suggested priority is valid
        const validPriorities = ['low', 'medium', 'high', 'critical'];
        if (validPriorities.includes(suggestedPriority)) {
          priority = suggestedPriority;
        } else {
          console.warn(`Invalid priority value suggested: ${suggestedPriority}, using default: ${priority}`);
        }
      }
      
      // Update the ticket with only necessary fields - no AI info
      const { error } = await supabase
        .from('tickets')
        .update({
          department_id: departmentId,
          assigned_to: null, // Will be assigned by the department manager later
          priority: priority
        })
        .eq('id', routingResults.ticket.id);

      if (error) {
        console.error('Error updating ticket with routing decision:', error);
        throw new Error(`Failed to update ticket: ${error.message}`);
      }

      // Get department name for the toast message
      let departmentName = routingResults.routing_decision.assigned_department;
      
      // Toast success message
      toast({
        title: "Routing Accepted",
        description: `Ticket has been routed to ${departmentName} department.`,
      });

      // Complete the ticket creation process
      onTicketCreated();
    } catch (error: any) {
      console.error('Error accepting routing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to route ticket. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRejectRouting = () => {
    setRoutingResults(null);
    setIsRoutingTicket(false);
    toast({
      title: "Routing Rejected",
      description: "Please modify your ticket details and try again.",
      variant: "destructive"
    });
  };

  const isFormValid = formData.title && formData.description && formData.category && formData.priority;

  if (isRoutingTicket || routingResults) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ticket Routing</h2>
            <p className="text-gray-600">Our AI is analyzing your ticket to determine the best department</p>
          </div>
          <Button variant="outline" onClick={onCancel} disabled={isRoutingTicket && !routingResults}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        <TicketRoutingResults 
          routingResults={routingResults} 
          onAccept={handleAcceptRouting}
          onReject={handleRejectRouting}
          isLoading={isRoutingTicket && !routingResults}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Ticket</h2>
          <p className="text-gray-600">Describe your issue and our AI will route it to the right team</p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
              <CardDescription>Provide information about your request</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of your issue"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading categories...
                          </SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${priority.color.split(' ')[0]}`}></div>
                              <span>{priority.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your issue..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachments">Attachments</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 mb-2">
                      Drag and drop files here, or click to browse
                    </div>
                    <input
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Choose Files
                    </Button>
                  </div>
                  
                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={!isFormValid || isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Creating Ticket...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create Ticket
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {aiSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span>AI Suggestions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">{suggestion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                <p className="text-sm text-gray-600">Be specific in your description for faster resolution</p>
              </div>
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                <p className="text-sm text-gray-600">Include error messages or screenshots when possible</p>
              </div>
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                <p className="text-sm text-gray-600">Our AI system will analyze your ticket and suggest the best department</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketCreationForm;
