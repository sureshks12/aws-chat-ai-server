import { getGeminiClient } from '../config/gemini.js';
import { REGION_MAPPINGS } from '../config/aws.js';
import logger from '../utils/logger.js';

/**
 * Clean model output string and extract JSON object.
 * @param {string} text 
 * @returns {object}
 */
const parseJsonFromMarkdown = (text) => {
  let cleaned = text.trim();
  // Remove markdown code fences if present (```json ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }
  return JSON.parse(cleaned);
};

/**
 * Map named location or region alias to valid AWS region identifier.
 * @param {string} regionInput 
 * @param {string} defaultRegion 
 * @returns {string}
 */
export const mapRegion = (regionInput, defaultRegion = 'ap-south-1') => {
  if (!regionInput || typeof regionInput !== 'string') {
    return defaultRegion;
  }
  const normalized = regionInput.toLowerCase().trim();
  if (REGION_MAPPINGS[normalized]) {
    return REGION_MAPPINGS[normalized];
  }
  // Check if it already matches AWS region code format (e.g., ap-south-1, us-east-1)
  if (/^[a-z]{2}-[a-z]+-\d+$/.test(normalized)) {
    return normalized;
  }
  return defaultRegion;
};

/**
 * Analyzes natural language query using Gemini AI model to extract AWS intent, parameters, and filters.
 * Returns strictly structured JSON payload.
 * 
 * @param {string} userQuestion 
 * @param {string} defaultRegion 
 * @returns {Promise<Object>} Analyzed command object { service, operation, region, filters }
 */
export const analyzeQuery = async (userQuestion, defaultRegion = 'ap-south-1') => {
  try {
    const ai = getGeminiClient();
    // Using gemini-1.5-flash model
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `
You are an expert AWS infrastructure intent extractor.
Your job is to analyze user natural language queries and map them to AWS services and operations.

CRITICAL INSTRUCTIONS:
1. You MUST return ONLY valid JSON.
2. DO NOT include markdown formatting outside the JSON, commentary, note, or conversational text.
3. Region Mapping Rules:
   - "Mumbai" -> "ap-south-1"
   - "Virginia" -> "us-east-1"
   - "Oregon" -> "us-west-2"
   - "Ohio" -> "us-east-2"
   - If no region is explicitly requested by user, default to "${defaultRegion}".

4. Operation Mapping Rules:
   - Reading/Listing EC2 instances (e.g. "show my ec2 instances", "get running instances", "list servers in virginia") -> operation: "describe_instances", service: "ec2"
   - Creating/Launching EC2 instances -> operation: "create_ec2", service: "ec2"
   - Terminating EC2 instances -> operation: "terminate_ec2", service: "ec2"
   - Starting EC2 instances -> operation: "start_instance", service: "ec2"
   - Stopping EC2 instances -> operation: "stop_instance", service: "ec2"
   - Running EC2 instances -> operation: "run_instance", service: "ec2"

5. Filter Extraction Rules:
   - Support AWS EC2 filters:
     - "instance-state-name": (e.g., "running", "stopped", "terminated")
     - "instance-type": (e.g., "t2.micro", "t3.medium")
     - "tag:Name": (e.g., instance name tags)
   - Store filters as an array of objects: [{"name": "instance-state-name", "values": ["running"]}]

Expected JSON Format:
{
  "service": "ec2",
  "operation": "describe_instances",
  "region": "ap-south-1",
  "filters": [
    {
      "name": "instance-state-name",
      "values": ["running"]
    }
  ]
}

User Question: "${userQuestion}"
`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const rawText = response.text();

    logger.info(`Gemini raw response: ${rawText}`);
    const parsedJSON = parseJsonFromMarkdown(rawText);

    // Ensure mapped region is normalized
    parsedJSON.region = mapRegion(parsedJSON.region, defaultRegion);
    if (!parsedJSON.filters) {
      parsedJSON.filters = [];
    }

    return parsedJSON;
  } catch (error) {
    logger.error('Gemini Service error during query parsing:', error);
    // Fallback parser if Gemini fails or returns malformed response
    return fallbackParser(userQuestion, defaultRegion);
  }
};

/**
 * Simple heuristic fallback if Gemini API call fails or returns non-JSON.
 */
const fallbackParser = (question, defaultRegion) => {
  const q = question.toLowerCase();
  
  if (q.includes('create') || q.includes('launch')) {
    return { service: 'ec2', operation: 'create_ec2', region: defaultRegion, filters: [] };
  }
  if (q.includes('terminate') || q.includes('delete')) {
    return { service: 'ec2', operation: 'terminate_ec2', region: defaultRegion, filters: [] };
  }
  if (q.includes('stop')) {
    return { service: 'ec2', operation: 'stop_instance', region: defaultRegion, filters: [] };
  }
  if (q.includes('start')) {
    return { service: 'ec2', operation: 'start_instance', region: defaultRegion, filters: [] };
  }

  // Default fallback assumes describe_instances
  const filters = [];
  if (q.includes('running')) {
    filters.push({ name: 'instance-state-name', values: ['running'] });
  } else if (q.includes('stopped')) {
    filters.push({ name: 'instance-state-name', values: ['stopped'] });
  }

  let region = defaultRegion;
  if (q.includes('mumbai')) region = 'ap-south-1';
  if (q.includes('virginia')) region = 'us-east-1';
  if (q.includes('oregon')) region = 'us-west-2';
  if (q.includes('ohio')) region = 'us-east-2';

  return {
    service: 'ec2',
    operation: 'describe_instances',
    region,
    filters
  };
};

export default {
  analyzeQuery,
  mapRegion
};
