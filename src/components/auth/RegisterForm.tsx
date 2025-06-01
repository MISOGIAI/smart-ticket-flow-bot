
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
    admin_code: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching departments:', error);
    } else {
      setDepartments(data || []);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
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
    e.preventDefault();
    setLoading(true);

    // Validate role-specific requirements
    if (formData.role === 'support_agent' && !roleSpecificData.department_id) {
      toast({
        title: "Department Required",
        description: "Support agents must select a department",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.role === 'manager' && !roleSpecificData.department_id) {
      toast({
        title: "Department Required",
        description: "Managers must select a department to manage",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.role === 'super_admin' && !roleSpecificData.admin_code) {
      toast({
        title: "Admin Code Required",
        description: "Super admin role requires verification code",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const userData = {
      name: formData.name,
      role: formData.role,
      ...roleSpecificData,
      expertise_areas: roleSpecificData.expertise_areas ? 
        roleSpecificData.expertise_areas.split(',').map(s => s.trim()) : [],
    };

    const { error } = await signUp(formData.email, formData.password, userData);

    if (error) {
      toast({
        title: "Registration Failed",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account.",
      });
    }

    setLoading(false);
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

      {formData.role === 'support_agent' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="department">Department (Required)</Label>
            <Select 
              value={roleSpecificData.department_id} 
              onValueChange={(value) => setRoleSpecificData({ ...roleSpecificData, department_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expertise">Expertise Areas (Optional)</Label>
            <Input
              id="expertise"
              value={roleSpecificData.expertise_areas}
              onChange={(e) => setRoleSpecificData({ ...roleSpecificData, expertise_areas: e.target.value })}
              placeholder="e.g., Password Reset, Network Issues (comma separated)"
            />
          </div>
        </>
      )}

      {formData.role === 'manager' && (
        <div className="space-y-2">
          <Label htmlFor="department">Department to Manage (Required)</Label>
          <Select 
            value={roleSpecificData.department_id} 
            onValueChange={(value) => setRoleSpecificData({ ...roleSpecificData, department_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.role === 'super_admin' && (
        <div className="space-y-2">
          <Label htmlFor="admin_code">Admin Verification Code (Required)</Label>
          <Input
            id="admin_code"
            type="password"
            value={roleSpecificData.admin_code}
            onChange={(e) => setRoleSpecificData({ ...roleSpecificData, admin_code: e.target.value })}
            placeholder="Enter admin verification code"
          />
        </div>
      )}

      <div className="flex space-x-2">
        <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
          Back
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
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
