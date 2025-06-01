import OpenAI from "openai";
import { TicketWithRelations } from "./ticket-service";
import { embeddingsService, TicketEmbedding } from "./embeddings-service";
import { supabase } from '@/integrations/supabase/client';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Define department contexts with detailed prompts
// Department IDs will be fetched from the database
const departmentContexts = {
  "HR": `
    You are the HR Department Agent in a help desk ticket routing system. Your role is to evaluate if a ticket should be assigned to the Human Resources department.

    HR typically handles:
    - Employee onboarding and offboarding processes
    - Benefits administration and queries
    - Leave and time-off requests
    - Payroll questions
    - Workplace policy and compliance issues
    - Performance management
    - Training and development inquiries
    - Employee relations and conflict resolution

    You'll be provided with:
    1. A new ticket's details (title, description, category, priority)
    2. Several similar historical tickets that were previously handled by HR (if available)

    Be realistic but also try to take ownership of tickets that genuinely belong to HR.
    Don't claim tickets that clearly belong to other departments.
    
    Evaluate how well this ticket matches HR's responsibility areas, using:
    - The nature of the request (is it HR-related?)
    - The specific HR policies or functions mentioned
    - The type of assistance needed
    - Patterns from similar historical tickets
  `,
  "IT Support": `
    You are the IT Department Agent in a help desk ticket routing system. Your role is to evaluate if a ticket should be assigned to the IT Support department.

    IT Support typically handles:
    - Hardware issues (computers, printers, phones, etc.)
    - Software problems (installations, updates, bugs)
    - Network connectivity issues
    - System access and authentication
    - Password resets
    - Email and communication tools support
    - IT security concerns
    - Data backup and recovery
    
    You'll be provided with:
    1. A new ticket's details (title, description, category, priority)
    2. Several similar historical tickets that were previously handled by IT (if available)

    Be realistic but also try to take ownership of tickets that genuinely belong to IT.
    Don't claim tickets that clearly belong to other departments.
    
    Evaluate how well this ticket matches IT's responsibility areas, using:
    - Technical nature of the issue
    - Specific systems, hardware, or software mentioned
    - Type of technical support needed
    - Patterns from similar historical tickets
  `,
  "Facilities": `
    You are the Facilities Department Agent in a help desk ticket routing system. Your role is to evaluate if a ticket should be assigned to the Facilities department.

    Facilities typically handles:
    - Building maintenance issues
    - Office equipment (non-IT) problems
    - Heating, ventilation, and air conditioning (HVAC)
    - Lighting and electrical issues
    - Plumbing and water problems
    - Cleaning and janitorial requests
    - Office space planning and moves
    - Safety and security concerns
    - Parking and transportation issues
    
    You'll be provided with:
    1. A new ticket's details (title, description, category, priority)
    2. Several similar historical tickets that were previously handled by Facilities (if available)

    Be realistic but also try to take ownership of tickets that genuinely belong to Facilities.
    Don't claim tickets that clearly belong to other departments.
    
    Evaluate how well this ticket matches Facilities' responsibility areas, using:
    - Physical/environmental nature of the issue
    - Building systems or office areas mentioned
    - Type of facility support needed
    - Patterns from similar historical tickets
  `,
  "Admin": `
    You are the Admin Department Agent in a help desk ticket routing system. Your role is to evaluate if a ticket should be assigned to the Administrative department.

    Administrative typically handles:
    - Office supplies and equipment ordering
    - Document management and filing
    - Meeting and event coordination
    - Travel arrangements
    - Visitor management
    - General administrative inquiries
    - Mail and courier services
    - Procurement and vendor management
    - General organizational questions
    
    You'll be provided with:
    1. A new ticket's details (title, description, category, priority)
    2. Several similar historical tickets that were previously handled by Admin (if available)

    Be realistic but also try to take ownership of tickets that genuinely belong to Admin.
    Don't claim tickets that clearly belong to other departments.
    
    Evaluate how well this ticket matches Admin's responsibility areas, using:
    - Administrative nature of the request
    - Office operations or business processes mentioned
    - Type of administrative support needed
    - Patterns from similar historical tickets
  `,
};

// Response format schema for department agents
const schemaFormat = `
IMPORTANT: You must respond with ONLY a JSON object and nothing else - no markdown formatting, no backticks, no explanations.
Return ONLY the following JSON structure:

{
  "interest_level": number (0 to 100),
  "confidence_score": number (0 to 100),
  "rationale": string (detailed explanation for your assessment),
  "suggested_priority": "Critical" | "High" | "Medium" | "Low",
  "recommended_tags": string[] (up to 3 tags),
  "estimated_resolution_time": string (e.g., "1-2 hours", "1 day", "3-5 days")
}
`;

// Prompt for the assigner agent
const assignerPrompt = `
You are the Assigner Agent in a help desk ticket routing system. Your role is to make the final decision about which department should handle a new ticket.

You'll receive:
1. The ticket details
2. Evaluations from each department agent, including:
   - Interest level (0-100%)
   - Confidence score (0-100%)
   - Rationale for why they should or shouldn't handle it
   - Suggested priority
   - Recommended tags

Your task is to:
1. Consider each department's interest and confidence
2. Analyze their rationales objectively
3. Determine which department is most appropriate
4. Provide a brief explanation for your decision
5. Include relevant tags and set the final priority

When deciding:
- Give more weight to departments with BOTH high interest and high confidence
- Critically evaluate each rationale for logical reasoning
- Consider the ticket's content and category more than just agent scores
- If multiple departments could handle it, choose the best fit based on expertise
- If no department is clearly appropriate, choose the one with the strongest case

The goal is accurate routing to improve resolution speed and quality.

IMPORTANT: Respond with ONLY a JSON object and nothing else - no markdown formatting, no backticks, no explanations.
Return ONLY the following JSON structure:

{
  "assigned_department": string (department name),
  "department_id": string (department ID),
  "reason": string (brief explanation for your decision),
  "confidence": number (0-100, your confidence in this decision),
  "priority": "Critical" | "High" | "Medium" | "Low",
  "tags": string[] (up to 3 tags),
  "estimated_resolution_time": string
}
`;

// Fetch departments from the database
async function fetchDepartments() {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name');
    
    if (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
    
    return data.map(dept => ({
      id: dept.id,
      name: dept.name,
      context: departmentContexts[dept.name] || ''
    }));
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    // Fallback to default departments if database fetch fails
    return Object.entries(departmentContexts).map(([name, context], index) => ({
      id: String(index + 1),
      name,
      context
    }));
  }
}

// Find similar tickets by department
function findSimilarTicketsByDepartment(
  embedding: number[],
  departmentName: string,
  topK: number = 5
): (TicketEmbedding & { similarity: number })[] {
  console.log(`🔍 Finding similar tickets for department: ${departmentName}`);
  
  // Get all embeddings
  const allEmbeddings = embeddingsService.getEmbeddings();
  
  // Filter by department
  const departmentEmbeddings = allEmbeddings.filter(
    emb => emb.metadata.department_name === departmentName
  );
  
  console.log(`📊 Found ${departmentEmbeddings.length} tickets in ${departmentName} department`);
  
  if (departmentEmbeddings.length === 0) {
    return [];
  }

  // Calculate similarity scores
  const withScores = departmentEmbeddings.map(emb => {
    const similarity = cosineSimilarity(embedding, emb.embedding);
    return {
      ...emb,
      similarity
    };
  });
  
  // Sort by similarity and return top K
  return withScores
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

// Utility function for cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

// Format similar tickets for agent prompt
function formatSimilarTicketsForPrompt(similarTickets: (TicketEmbedding & { similarity: number })[]): string {
  if (similarTickets.length === 0) {
    return "No similar historical tickets found.";
  }
  
  return similarTickets
    .map((ticket, index) => {
      return `Similar Ticket ${index + 1} (Similarity: ${(ticket.similarity * 100).toFixed(1)}%):
- Title: ${ticket.metadata.title}
- Description: ${ticket.metadata.description}
- Priority: ${ticket.metadata.priority}
- Status: ${ticket.metadata.status}
- Category: ${ticket.metadata.category_name}
- Department: ${ticket.metadata.department_name}
${ticket.metadata.resolved_at ? `- Resolution Time: ${formatResolutionTime(ticket.metadata.created_at, ticket.metadata.resolved_at)}` : ''}`;
    })
    .join("\n\n");
}

// Calculate resolution time between dates
function formatResolutionTime(createdAt: string, resolvedAt: string): string {
  const created = new Date(createdAt);
  const resolved = new Date(resolvedAt);
  const diffMs = resolved.getTime() - created.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 1) {
    return `${Math.round(diffHours * 60)} minutes`;
  } else if (diffHours < 24) {
    return `${Math.round(diffHours)} hours`;
  } else {
    return `${Math.round(diffHours / 24)} days`;
  }
}

// Modify evaluateWithDepartmentAgent to accept a department object directly
async function evaluateWithDepartmentAgent(
  department: { id: string, name: string, context: string }, 
  ticket: TicketWithRelations,
  ticketEmbedding: number[]
) {
  try {
    console.log(`🔄 ${department.name} agent evaluating ticket: ${ticket.ticket_number}`);
    
    // Find similar tickets for this department
    const similarTickets = findSimilarTicketsByDepartment(
      ticketEmbedding, 
      department.name
    );
    
    // Create prompt for the department agent
    const similarTicketsPrompt = formatSimilarTicketsForPrompt(similarTickets);
    
    // Make OpenAI API call for department evaluation
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or another appropriate model
      messages: [
        { 
          role: "system", 
          content: `${department.context}\n\n${schemaFormat}` 
        },
        {
          role: "user",
          content: `A new helpdesk ticket has been submitted:

Title: ${ticket.title}
Description: ${ticket.description}
Category: ${ticket.category?.name || ticket.category_name || "Uncategorized"}
Priority: ${ticket.priority}
Requester: ${ticket.requester?.name || "Unknown"}

${similarTickets.length > 0 ? 
`Here are similar tickets previously handled by the ${department.name} department:
${similarTicketsPrompt}` : 
"No similar tickets were found for reference."}

Based on this information, evaluate if this ticket should be assigned to the ${department.name} department.
Return ONLY a valid JSON object with your interest level, confidence score, and rationale.`
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }, // Ensure JSON response
    });

    const content = response.choices[0].message.content;
    
    try {
      // Parse the response and add department information
      const parsedResponse = JSON.parse(content);
      return {
        department_id: department.id,
        department_name: department.name,
        interest_level: parsedResponse.interest_level,
        confidence_score: parsedResponse.confidence_score,
        rationale: parsedResponse.rationale,
        suggested_priority: normalizePriority(parsedResponse.suggested_priority),
        recommended_tags: parsedResponse.recommended_tags,
        estimated_resolution_time: parsedResponse.estimated_resolution_time
      };
    } catch (e) {
      console.error(`Failed to parse response from ${department.name}:`, e);
      return null;
    }
  } catch (error) {
    console.error(`Error with ${department.name} agent:`, error);
    return null;
  }
}

// Helper function to normalize priority values
function normalizePriority(priority: string): string {
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  const normalizedPriority = priority?.toLowerCase() || 'medium';
  return validPriorities.includes(normalizedPriority) ? normalizedPriority : 'medium';
}

// Final assigner agent to make routing decision
async function assignTicket(
  ticket: TicketWithRelations,
  departmentResponses: any[]
) {
  console.log(`🔄 Assigner agent making final decision for ticket: ${ticket.ticket_number}`);
  
  const validResponses = departmentResponses.filter(Boolean);
  if (validResponses.length === 0) {
    console.error("No valid department responses to make a decision");
    
    // Fetch a default department ID (IT Support) from the database
    try {
      const { data } = await supabase
        .from('departments')
        .select('id, name')
        .eq('name', 'IT Support')
        .single();
      
      const defaultDeptId = data?.id || '0';
      
      return {
        assigned_department: "IT Support",
        department_id: defaultDeptId, // Using actual UUID from database
        reason: "No valid department evaluations were received. Defaulting to IT Support.",
        confidence: 30,
        priority: normalizePriority(ticket.priority),
        tags: ["auto-assigned", "requires-review"],
        estimated_resolution_time: "Unknown"
      };
    } catch (error) {
      console.error("Error fetching default department:", error);
      return {
        assigned_department: "IT Support",
        department_id: "0",
        reason: "No valid department evaluations were received. Defaulting to IT Support.",
        confidence: 30,
        priority: normalizePriority(ticket.priority),
        tags: ["auto-assigned", "requires-review"],
        estimated_resolution_time: "Unknown"
      };
    }
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or another appropriate model
      messages: [
        { 
          role: "system", 
          content: assignerPrompt 
        },
        {
          role: "user",
          content: `A new helpdesk ticket has been submitted:

Title: ${ticket.title}
Description: ${ticket.description}
Category: ${ticket.category?.name || ticket.category_name || "Uncategorized"}
Priority: ${ticket.priority}
Requester: ${ticket.requester?.name || "Unknown"}

Here are the department agent evaluations:

${validResponses.map((resp, index) => `
${resp.department_name} Department Evaluation:
- Interest Level: ${resp.interest_level}/100
- Confidence Score: ${resp.confidence_score}/100
- Rationale: ${resp.rationale}
- Suggested Priority: ${resp.suggested_priority}
- Recommended Tags: ${resp.recommended_tags.join(", ")}
- Estimated Resolution Time: ${resp.estimated_resolution_time}
`).join("\n")}

Based on these evaluations, make the final routing decision.
Return ONLY a valid JSON object.`
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }, // Ensure JSON response
    });

    const content = response.choices[0].message.content;
    const parsedResponse = JSON.parse(content);
    
    // Ensure we're returning the department_id from our database
    // The AI might return a custom ID like IT-001, so we need to map it to a real UUID
    const departmentName = parsedResponse.assigned_department;
    
    // Look up the department's UUID from our responses
    const matchingDept = validResponses.find(dept => 
      dept.department_name.toLowerCase() === departmentName.toLowerCase()
    );
    
    if (matchingDept) {
      parsedResponse.department_id = matchingDept.department_id;
    }
    
    // Normalize the priority value
    if (parsedResponse.priority) {
      parsedResponse.priority = normalizePriority(parsedResponse.priority);
    }
    
    return parsedResponse;
  } catch (error) {
    console.error("Error with assigner agent:", error);
    
    // Emergency fallback
    const sorted = validResponses.sort(
      (a, b) => 
        (b.interest_level * b.confidence_score) - 
        (a.interest_level * a.confidence_score)
    );
    
    const best = sorted[0];
    return {
      assigned_department: best.department_name,
      department_id: best.department_id, // This is already a valid UUID from the database
      reason: "Error in assigner agent. Automatic selection based on highest score.",
      confidence: Math.round((best.interest_level * best.confidence_score) / 100),
      priority: normalizePriority(best.suggested_priority || ticket.priority),
      tags: best.recommended_tags || ["auto-assigned"],
      estimated_resolution_time: best.estimated_resolution_time || "Unknown"
    };
  }
}

// Update routeTicket to ensure valid department IDs
export async function routeTicket(ticket: TicketWithRelations): Promise<any> {
  console.log(`🔄 Starting routing process for ticket: ${ticket.ticket_number}`);
  
  try {
    // Get the ticket embedding for similarity search - using only the text parameter
    const ticketEmbedding = await embeddingsService.generateOpenAIEmbedding(
      `${ticket.title} ${ticket.description}`
    );
    
    // Fetch departments from the database
    const departments = await fetchDepartments();
    
    // Evaluate the ticket with each department agent in parallel
    const departmentPromises = departments.map(department => 
      evaluateWithDepartmentAgent(department, ticket, ticketEmbedding)
    );
    
    // Wait for all department evaluations
    const departmentResults = (await Promise.all(departmentPromises)).filter(Boolean);
    
    console.log(`✅ Received ${departmentResults.length} department evaluations`);
    
    // Default to IT Support if no valid department evaluations
    if (departmentResults.length === 0) {
      console.warn("⚠️ No valid department evaluations, using default department (IT Support)");
      
      // Find IT Support department or use first department as fallback
      const itDept = departments.find(d => d.name === "IT Support") || departments[0];
      
      if (!itDept) {
        throw new Error("No departments found in database");
      }
      
      const defaultDecision = {
        assigned_department: itDept.name,
        department_id: itDept.id, // This is a valid UUID from the database
        reason: "No valid department evaluations were received. The ticket appears to be technical in nature, so defaulting to IT Support.",
        confidence: 40,
        priority: normalizePriority(ticket.priority),
        tags: ["auto-assigned", "requires-review"],
        estimated_resolution_time: "1-2 days"
      };
      
      return {
        ticket: ticket,
        department_evaluations: [],
        routing_decision: defaultDecision
      };
    }
    
    // Get final routing decision from assigner agent
    let routingDecision;
    try {
      routingDecision = await assignTicket(ticket, departmentResults);
      console.log("✅ Routing decision made:", routingDecision.assigned_department);
    } catch (error) {
      console.error("❌ Error in assigner agent, using fallback selection:", error);
      
      // Sort by combined score as fallback
      const sorted = departmentResults.sort(
        (a, b) => 
          (b.interest_level * b.confidence_score) - 
          (a.interest_level * a.confidence_score)
      );
      
      const best = sorted[0];
      routingDecision = {
        assigned_department: best.department_name,
        department_id: best.department_id, // This is already a valid UUID from the database
        reason: `Automatic fallback selection due to error in assigner agent. Selected department with highest combined score. ${best.rationale}`,
        confidence: Math.round((best.interest_level * best.confidence_score) / 100),
        priority: normalizePriority(best.suggested_priority || ticket.priority),
        tags: best.recommended_tags || ["auto-assigned"],
        estimated_resolution_time: best.estimated_resolution_time || "Unknown"
      };
    }
    
    // Create a mapping of department names to IDs for validation
    const deptNameToIdMap: {[key: string]: string} = {};
    departments.forEach(dept => {
      deptNameToIdMap[dept.name] = dept.id;
    });
    
    // Ensure routing decision has all required fields with defaults
    // and make sure we have a valid UUID for department_id
    const validatedDecision = {
      assigned_department: routingDecision.assigned_department || "IT Support",
      department_id: deptNameToIdMap[routingDecision.assigned_department] || 
                    routingDecision.department_id || 
                    departments.find(d => d.name === "IT Support")?.id || 
                    departments[0].id,
      reason: routingDecision.reason || "No specific reason provided.",
      confidence: routingDecision.confidence || 50,
      priority: normalizePriority(routingDecision.priority || ticket.priority),
      tags: Array.isArray(routingDecision.tags) ? routingDecision.tags : ["auto-assigned"],
      estimated_resolution_time: routingDecision.estimated_resolution_time || "1-2 days"
    };
    
    // Validate that department_id is a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validatedDecision.department_id);
    if (!isUUID) {
      console.warn(`Invalid department ID format detected: ${validatedDecision.department_id}. Using fallback ID.`);
      validatedDecision.department_id = departments.find(d => d.name === "IT Support")?.id || departments[0].id;
    }
    
    return {
      ticket: ticket,
      department_evaluations: departmentResults,
      routing_decision: validatedDecision
    };
  } catch (error) {
    console.error("❌ Critical error in routing process:", error);
    
    // Emergency fallback - fetch departments for default ID
    const fallbackDepts = await fetchDepartments();
    const defaultDept = fallbackDepts.find(d => d.name === "IT Support") || fallbackDepts[0];
    
    // Return a safe default
    return {
      ticket: ticket,
      department_evaluations: [],
      routing_decision: {
        assigned_department: defaultDept.name,
        department_id: defaultDept.id,
        reason: "An error occurred during the routing process. Defaulting to IT Support.",
        confidence: 30,
        priority: normalizePriority(ticket.priority),
        tags: ["error-fallback", "requires-review"],
        estimated_resolution_time: "Unknown"
      }
    };
  }
}

export const ticketRoutingService = {
  routeTicket,
  findSimilarTicketsByDepartment
}; 