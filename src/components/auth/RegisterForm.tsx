
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

interface Department {
  id: string;
  name: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  // Step 1 data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  // Step 2 data
  const [roleSpecificData, setRoleSpecificData] = useState({
    job_title: '',
    department_id: '',
    expertise_areas: '',
    reports_to: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    console.log('Departments loaded:', departments);
    console.log('Selected department:', roleSpecificData.department_id);
  }, [departments, roleSpecificData.department_id]);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      console.log('Attempting to fetch departments...');
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      const { data, error, count } = await supabase
        .from('departments')
        .select('id, name', { count: 'exact' })
        .order('name');

      console.log('Query result - data:', data, 'error:', error, 'count:', count);
      
      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Successfully fetched departments:', data);
      setDepartments(data || []);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      toast({
        title: "Error loading departments",
        description: `${error.message || "Failed to load departments"} - Check console for details`,
        variant: "destructive"
      });
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate step 1
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    if (!formData.role) {
      toast({
        title: "Role Required",
        description: "Please select a role",
        variant: "destructive",
      });
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    console.log('🔵 Complete Registration button clicked!');
    e.preventDefault();
    setLoading(true);
    
    console.log('🔍 Form data at submission:', {
      formData,
      roleSpecificData,
      departments: departments.length,
      loadingDepartments
    });

    // Step 2 validation and submission
    // Note: job_title is optional in database schema and not required for all roles
    console.log('✅ Proceeding with registration - job_title is optional');

    // Check if departments are required but failed to load
    if ((formData.role === 'support_agent' || formData.role === 'manager')) {
      console.log('🏢 Checking department validation for role:', formData.role);
      if (departments.length === 0 && !loadingDepartments) {
        // Departments failed to load, but allow registration to proceed
        console.warn('⚠️ Departments failed to load, proceeding without department validation');
        toast({
          title: "Department Loading Issue",
          description: "Departments couldn't be loaded. Registration will proceed without department assignment.",
          variant: "default"
        });
      } else if (departments.length > 0 && !roleSpecificData.department_id) {
        // Departments are available but none selected
        console.log('❌ Validation failed: Department selection required');
        toast({
          title: "Missing Information",
          description: "Please select your department",
          variant: "destructive"
        });
        setLoading(false);
        return;
      } else if (roleSpecificData.department_id && departments.length > 0) {
        // Validate selected department exists
        const selectedDept = departments.find(dept => dept.id === roleSpecificData.department_id);
        if (!selectedDept) {
          console.log('❌ Validation failed: Invalid department selected');
          toast({
            title: "Invalid Department",
            description: "Please select a valid department",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        console.log('✅ Selected department:', selectedDept.name, 'ID:', selectedDept.id);
      }
      console.log('✅ Department validation passed');
    }

    try {
      const userData = {
        ...formData,
        ...roleSpecificData,
        expertise_areas: roleSpecificData.expertise_areas ? roleSpecificData.expertise_areas.split(',').map(area => area.trim()) : []
      };

      console.log('🚀 Starting registration process with user data:', userData);
      console.log('🔍 FormData:', formData);
      console.log('🔍 RoleSpecificData:', roleSpecificData);
      console.log('🔍 Department ID specifically:', userData.department_id, 'Type:', typeof userData.department_id);
      console.log('🔍 Selected department from state:', roleSpecificData.department_id, 'Type:', typeof roleSpecificData.department_id);
      console.log('🔍 Available departments at submission:', departments);
      console.log('🔍 Department validation - is department_id truthy?', !!userData.department_id);
      console.log('🔍 Department validation - is department_id empty string?', userData.department_id === '');
      console.log('🔍 Department validation - is department_id null?', userData.department_id === null);
      console.log('🔍 Department validation - is department_id undefined?', userData.department_id === undefined);
      console.log('📧 Calling signUp function...');
      
      await signUp(userData);
      
      console.log('✅ Registration successful!');
      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account.",
      });
      
      console.log('🎉 Calling onSuccess callback');
      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive"
      });
    } finally {
      console.log('🏁 Registration process completed, setting loading to false');
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter your full name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          placeholder="Enter your email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          placeholder="Enter your password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
          placeholder="Confirm your password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="support_agent">Support Agent</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleFinalSubmit} className="space-y-4">
      {formData.role === 'employee' && (
        <div className="space-y-2">
          <Label htmlFor="job_title">Job Title (Optional)</Label>
          <Input
            id="job_title"
            value={roleSpecificData.job_title}
            onChange={(e) => setRoleSpecificData({ ...roleSpecificData, job_title: e.target.value })}
            placeholder="Enter your job title"
          />
        </div>
      )}

      {(formData.role === 'support_agent' || formData.role === 'manager') && (
        <div className="space-y-2">
          <Label htmlFor="department">
            Department {departments.length === 0 && !loadingDepartments ? '(Optional - Failed to load)' : '(Required)'}
          </Label>
          {departments.length === 0 && !loadingDepartments ? (
            <div className="p-3 border rounded-md bg-yellow-50 border-yellow-200">
              <p className="text-sm text-yellow-800">
                Unable to load departments. You can proceed with registration and assign a department later.
              </p>
            </div>
          ) : (
            <Select 
              value={roleSpecificData.department_id || ''} 
              onValueChange={(value) => {
                console.log('🔄 Department selection changed to:', value, 'Type:', typeof value);
                console.log('🔄 Available departments:', departments);
                const selectedDept = departments.find(d => d.id === value);
                console.log('🔄 Selected department object:', selectedDept);
                setRoleSpecificData({ ...roleSpecificData, department_id: value });
                console.log('🔄 Updated roleSpecificData will be:', { ...roleSpecificData, department_id: value });
              }}
              disabled={loadingDepartments}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingDepartments ? "Loading departments..." : "Select department"} />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Debug info */}
          <div className="text-xs text-gray-500">
            Current department_id: {roleSpecificData.department_id || 'None selected'}
          </div>
        </div>
      )}

      {formData.role === 'support_agent' && (
        <div className="space-y-2">
          <Label htmlFor="expertise">Expertise Areas (Optional)</Label>
          <Input
            id="expertise"
            value={roleSpecificData.expertise_areas}
            onChange={(e) => setRoleSpecificData({ ...roleSpecificData, expertise_areas: e.target.value })}
            placeholder="e.g., Password Reset, Network Issues (comma separated)"
          />
        </div>
      )}

      <div className="flex space-x-2">
        <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
          Back
        </Button>
        <Button 
          type="submit" 
          disabled={loading} 
          className="flex-1"
          onClick={() => console.log('🖱️ Complete Registration button clicked (onClick handler)')}
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </Button>
      </div>
    </form>
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account - Step {step} of 2</CardTitle>
        <CardDescription>
          {step === 1 ? 'Basic information' : 'Role-specific details'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 ? renderStep1() : renderStep2()}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sm text-blue-600 hover:underline"
          >
            Already have an account? Sign in
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
