import { supabase } from '@/integrations/supabase/client';
import { 
  DEPARTMENT_IDS, 
  getDepartmentNameById, 
  isValidDepartmentId, 
  getDefaultDepartmentId 
} from './constants';
import { UserProfile } from '@/components/auth/AuthProvider';

/**
 * Validate and get the correct department ID for a user
 * @param user The user profile to validate department ID for
 * @param options Optional configuration
 * @returns The validated department ID or null
 */
export const getValidDepartmentId = async (
  user: UserProfile | null, 
  options: { 
    defaultToItSupport?: boolean, 
    logInfo?: boolean 
  } = {}
): Promise<string | null> => {
  const { defaultToItSupport = true, logInfo = true } = options;
  
  if (!user?.department_id) {
    if (logInfo) console.warn('⚠️ User has no department_id');
    return defaultToItSupport ? getDefaultDepartmentId() : null;
  }
  
  const deptId = user.department_id;
  if (logInfo) console.log('🔍 Original user department_id:', deptId);
  
  // Validate if it's one of our known department IDs
  if (isValidDepartmentId(deptId)) {
    if (logInfo) console.log('✅ User department_id is valid:', deptId);
    return deptId;
  } else {
    if (logInfo) console.warn('⚠️ User department_id not recognized:', deptId);
    
    // Try to infer department from role or other info
    // For now, default to IT Support if configured
    if (defaultToItSupport) {
      const defaultDeptId = getDefaultDepartmentId();
      if (logInfo) console.log('🔄 Setting default department_id:', defaultDeptId);
      return defaultDeptId;
    }
    
    // Otherwise return the original (though invalid) ID
    return deptId;
  }
};

/**
 * Get tickets for a specific department
 * @param departmentId The department ID to get tickets for
 * @param options Additional query options
 * @returns The tickets for the department
 */
export const getTicketsForDepartment = async (
  departmentId: string,
  options: {
    assignedToId?: string | null;
    status?: string | string[];
    limit?: number;
  } = {}
) => {
  try {
    const { assignedToId, status, limit } = options;
    
    // Start building the query
    let query = supabase
      .from('tickets')
      .select(`
        id,
        title,
        description,
        priority,
        status,
        ticket_number,
        created_at,
        updated_at,
        requester:users!tickets_requester_id_fkey(name),
        assigned_agent:users!tickets_assigned_to_fkey(name),
        category:categories(name),
        department:departments(name)
      `)
      .eq('department_id', departmentId);
      
    // Filter by assigned to if specified
    if (assignedToId !== undefined) {
      if (assignedToId === null) {
        query = query.is('assigned_to', null);
      } else {
        query = query.eq('assigned_to', assignedToId);
      }
    }
    
    // Filter by status if specified
    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
    }
    
    // Order by created_at
    query = query.order('created_at', { ascending: false });
    
    // Limit if specified
    if (limit) {
      query = query.limit(limit);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching department tickets:', error);
      return [];
    }
    
    console.log(`✅ Fetched ${data.length} tickets for department: ${getDepartmentNameById(departmentId)}`);
    return data || [];
    
  } catch (error) {
    console.error('❌ Error in getTicketsForDepartment:', error);
    return [];
  }
}; 