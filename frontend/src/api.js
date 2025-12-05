/**
 * API Client for GRE Drill Sergeant Backend
 * Handles all HTTP communication with FastAPI backend
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Generate a new GRE session
 * @param {Object} params
 * @param {string} params.difficulty - "Beginner", "Intermediate", or "Advanced"
 * @param {string} params.exam_date - ISO date string
 * @returns {Promise<Object>} Session data with passage and questions
 */
export async function generateSession({ difficulty, exam_date }) {
  const response = await fetch(`${API_BASE_URL}/generate-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ difficulty, exam_date })
  });

  if (!response.ok) {
    throw new Error(`Failed to generate session: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Analyze mistakes in submitted answers
 * @param {Object} params
 * @param {string} params.session_id
 * @param {Object} params.answers - Map of question_id -> selected_option
 * @returns {Promise<Array>} Array of mistake diagnoses
 */
export async function analyzeMistakes({ session_id, answers }) {
  const response = await fetch(`${API_BASE_URL}/analyze-mistakes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, answers })
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze mistakes: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generate session summary
 * @param {Object} params
 * @param {string} params.session_id
 * @param {string} params.original_score
 * @param {string} params.final_mastery
 * @param {Array<string>} params.traps_identified
 * @param {string} params.exam_date
 * @returns {Promise<Object>} Summary with coach message
 */
export async function getSessionSummary({ session_id, original_score, final_mastery, traps_identified, exam_date }) {
  const response = await fetch(`${API_BASE_URL}/session-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, original_score, final_mastery, traps_identified, exam_date })
  });

  if (!response.ok) {
    throw new Error(`Failed to get summary: ${response.statusText}`);
  }

  return response.json();
}
