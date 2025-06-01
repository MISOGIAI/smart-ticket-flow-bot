/**
 * Application-wide constants
 */

// Hardcoded mapping of department names to their correct UUIDs
export const DEPARTMENT_IDS = {
  "IT Support": "f0ded6f3-a62f-4564-aee7-329b09c2e86f",
  "HR": "e8e453c5-7375-4732-9e62-84eb92d1150b",
  "Admin": "cc34a50b-867d-45ce-8167-00f65b34bbfa",
  "Facilities": "826e94b1-2951-4f01-95ba-379b5d8e02d7"
};

// Helper function to get department name from ID
export const getDepartmentNameById = (id: string): string => {
  for (const [name, deptId] of Object.entries(DEPARTMENT_IDS)) {
    if (deptId === id) return name;
  }
  return "Unknown Department";
};

// Helper function to get department ID from name
export const getDepartmentIdByName = (name: string): string | undefined => {
  return DEPARTMENT_IDS[name as keyof typeof DEPARTMENT_IDS];
};

// Helper function to validate a department ID
export const isValidDepartmentId = (id: string): boolean => {
  return Object.values(DEPARTMENT_IDS).includes(id);
};

// Helper function to get all department IDs
export const getAllDepartmentIds = (): string[] => {
  return Object.values(DEPARTMENT_IDS);
};

// Helper function to get all department names
export const getAllDepartmentNames = (): string[] => {
  return Object.keys(DEPARTMENT_IDS);
};

// Get default department ID (IT Support)
export const getDefaultDepartmentId = (): string => {
  return DEPARTMENT_IDS["IT Support"];
}; 