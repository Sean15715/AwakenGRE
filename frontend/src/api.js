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

/**
 * Register a new user
 * @param {Object} userData
 * @param {string} userData.username
 * @param {string} userData.email
 * @param {string} userData.password
 * @param {string} userData.exam_date
 * @returns {Promise<Object>} Created user data
 */
export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Registration failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Login user
 * @param {Object} credentials
 * @param {string} credentials.username
 * @param {string} credentials.password
 * @returns {Promise<Object>} Token data
 */
export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Login failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get current user details
 * @param {string} token - Access Token
 * @returns {Promise<Object>} User data
 */
export async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    }
  });

  if (!response.ok) {
     throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update current user details
 * @param {string} token - Access Token
 * @param {Object} updateData - Data to update (e.g. { exam_date: "..." })
 * @returns {Promise<Object>} Updated user data
 */
export async function updateUser(token, updateData) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(updateData)
  });

  if (!response.ok) {
     throw new Error(`Failed to update user: ${response.statusText}`);
  }

  return response.json();
}
