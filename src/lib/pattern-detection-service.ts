import { openai } from "@/integrations/openai/client";
import { DEPARTMENT_IDS, getDepartmentNameById } from "./constants";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  department_id?: string;
  status?: string;
  priority?: string;
  created_at?: string;
}

export interface DetectionResult {
  is_detected: boolean;
  rationale: string;
}

export interface PatternAnalysisResult {
  microSummaries: string[];
  macroSummary: string;
  repetitivePatterns: DetectionResult;
  misusePatterns: DetectionResult;
  departmentName: string;
}

class PatternDetectionService {
  /**
   * Summarizes a single ticket into a concise one-line summary
   */
  async summarizeTicket(ticket: Ticket): Promise<string> {
    console.log("📄 Summarizing ticket:", ticket.id);
    
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpdesk micro summarizer. Create a 1-sentence summary for a support ticket.
          Be precise, factual and focus on the core issue.`
        },
        {
          role: "user",
          content: `Ticket Title: ${ticket.title}\nDescription: ${ticket.description}`
        }
      ],
      temperature: 0.3,
    });

    return res.choices[0].message.content.trim();
  }

  /**
   * Creates a holistic overview from multiple ticket summaries
   */
  async summarizeAllTickets(microSummaries: string[], departmentName: string): Promise<string> {
    console.log("📊 Generating macro summary for department:", departmentName);
    
    const joined = microSummaries.map((s, i) => `- ${s}`).join("\n");
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a macro summarizer for the ${departmentName} department. 
          Combine the following micro summaries into an overview of ticket themes and patterns.
          Focus on identifying trends, common issues, and potential areas for improvement.`
        },
        {
          role: "user",
          content: joined
        }
      ],
      temperature: 0.4,
    });

    return res.choices[0].message.content.trim();
  }

  /**
   * Detects repetitive work patterns from ticket summaries
   */
  async detectRepetition(macroSummary: string, departmentName: string): Promise<DetectionResult> {
    console.log("🔁 Detecting repetitive patterns for department:", departmentName);
    
    const prompt = `
You are a pattern detection agent for the ${departmentName} department.

Analyze the summary below for repetition of work that could indicate automation opportunities 
or excessive recurring tasks. Consider:
- Recurring technical issues that could be prevented
- Repetitive user requests that could be self-service
- Administrative tasks that could be automated
- Training gaps indicated by repeated similar questions

Respond in JSON format like:
{
  "is_detected": true | false,
  "rationale": "reasoning with specific improvement suggestions"
}
    `;

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: macroSummary }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    try {
      return JSON.parse(res.choices[0].message.content) as DetectionResult;
    } catch (e) {
      console.error("Error parsing repetition detection result:", e);
      return { is_detected: false, rationale: "Could not parse agent output." };
    }
  }

  /**
   * Detects potential misuse patterns specific to a department
   */
  async detectMisuse(macroSummary: string, departmentName: string): Promise<DetectionResult> {
    console.log("🚨 Checking for misuse patterns for department:", departmentName);
    
    // Department-specific context for misuse detection
    let departmentContext = "";
    
    switch(departmentName) {
      case "IT Support":
        departmentContext = `
Focus on:
- Unauthorized software installation requests
- Suspicious access patterns or requests
- Potential security policy violations
- Inappropriate use of IT resources
- Attempts to circumvent security measures`;
        break;
      case "HR":
        departmentContext = `
Focus on:
- Inappropriate access to personnel information
- Requests that may violate company policies
- Potential workplace policy abuses
- Unusual patterns in time-off requests
- Potential harassment or misconduct indicators`;
        break;
      case "Admin":
        departmentContext = `
Focus on:
- Unusual procurement requests
- Policy circumvention attempts
- Resource misuse patterns
- Unauthorized access to administrative resources
- Unusual spending patterns`;
        break;
      case "Facilities":
        departmentContext = `
Focus on:
- Unusual or excessive resource utilization
- Safety procedure violations
- Unauthorized modifications to facilities
- Patterns of damage or misuse of facilities
- Suspicious access requests to restricted areas`;
        break;
      default:
        departmentContext = `Focus on general system misuse or suspicious activity patterns`;
    }

    const prompt = `
You are a misuse detection agent for the ${departmentName} department.

Check the macro summary for signs of improper ticket creation, system misuse, or security concerns.
${departmentContext}

Respond in JSON format:
{
  "is_detected": true | false,
  "rationale": "clear explanation of detected issues or confirmation of no misuse"
}
    `;

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: macroSummary }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    try {
      return JSON.parse(res.choices[0].message.content) as DetectionResult;
    } catch (e) {
      console.error("Error parsing misuse detection result:", e);
      return { is_detected: false, rationale: "Could not parse misuse agent output." };
    }
  }

  /**
   * Complete pattern detection pipeline for a set of tickets
   */
  async analyzeTickets(tickets: Ticket[]): Promise<PatternAnalysisResult> {
    if (!tickets || tickets.length === 0) {
      throw new Error("No tickets provided for analysis");
    }

    // Get department name
    const departmentId = tickets[0].department_id || "";
    const departmentName = getDepartmentNameById(departmentId);

    console.log(`📊 Starting pattern analysis for ${tickets.length} tickets in ${departmentName} department`);

    // Step 1: Generate micro-summaries
    console.log("Step 1: Generating micro-summaries");
    const microSummaries = await Promise.all(tickets.map(ticket => this.summarizeTicket(ticket)));

    // Step 2: Generate macro summary
    console.log("Step 2: Generating macro summary");
    const macroSummary = await this.summarizeAllTickets(microSummaries, departmentName);

    // Step 3: Detect repetitive patterns
    console.log("Step 3: Detecting repetitive patterns");
    const repetitivePatterns = await this.detectRepetition(macroSummary, departmentName);

    // Step 4: Detect misuse patterns
    console.log("Step 4: Detecting misuse patterns");
    const misusePatterns = await this.detectMisuse(macroSummary, departmentName);

    console.log("📊 Pattern analysis complete");

    return {
      microSummaries,
      macroSummary,
      repetitivePatterns,
      misusePatterns,
      departmentName
    };
  }
}

export const patternDetectionService = new PatternDetectionService(); 