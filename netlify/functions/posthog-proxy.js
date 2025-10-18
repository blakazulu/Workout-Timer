/**
 * Netlify Function: PostHog API Proxy
 *
 * This function acts as a secure proxy between your admin dashboard (client-side)
 * and PostHog's API, keeping your API key secret.
 *
 * Environment Variables Required:
 * - POSTHOG_PERSONAL_API_KEY: Your PostHog Personal API Key
 *
 * To get your API key:
 * 1. Go to PostHog → Settings → Personal API Keys
 * 2. Create new key with "read" permissions
 * 3. Add to Netlify: POSTHOG_PERSONAL_API_KEY=phx_...
 */

const POSTHOG_API_HOST = 'https://app.posthog.com';
const POSTHOG_PROJECT_ID = '235590'; // Your project ID

export async function handler(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Parse request body
    const { query } = JSON.parse(event.body);

    if (!query) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing query parameter' })
      };
    }

    // Check for API key
    const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;

    if (!apiKey) {
      console.error('POSTHOG_PERSONAL_API_KEY not set in environment variables');
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'PostHog API key not configured',
          hint: 'Add POSTHOG_PERSONAL_API_KEY to Netlify environment variables'
        })
      };
    }

    // Forward request to PostHog API
    const response = await fetch(
      `${POSTHOG_API_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ query })
      }
    );

    // Get response data
    const data = await response.json();

    // Check if request was successful
    if (!response.ok) {
      console.error('PostHog API error:', data);
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'PostHog API error',
          details: data
        })
      };
    }

    // Return successful response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Proxy error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
}
