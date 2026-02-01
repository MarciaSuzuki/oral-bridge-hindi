import Anthropic from '@anthropic-ai/sdk';

// Import prompts - these will be bundled by Vercel
import { AGENT_1_PROMPT } from '../src/prompts/agent1-exegesis.js';
import { AGENT_2_PROMPT } from '../src/prompts/agent2-translator.js';
import { AGENT_3_PROMPT } from '../src/prompts/agent3-style-reviewer.js';
import { AGENT_4_PROMPT } from '../src/prompts/agent4-theological-checker.js';
import { AGENT_5_PROMPT } from '../src/prompts/agent5-audio-reader.js';

const PROMPTS = {
  1: AGENT_1_PROMPT,
  2: AGENT_2_PROMPT,
  3: AGENT_3_PROMPT,
  4: AGENT_4_PROMPT,
  5: AGENT_5_PROMPT
};

const AGENT_NAMES = {
  1: 'Exegesis Analyst',
  2: 'Oral Translator',
  3: 'Oral Style Reviewer',
  4: 'Theological Accuracy Checker',
  5: 'Audio Reader'
};

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'ANTHROPIC_API_KEY not configured. Add it in Vercel environment variables.' 
    });
  }

  try {
    const { agentId, input, previousOutputs } = req.body;

    // Validate agent ID
    if (!agentId || agentId < 1 || agentId > 5) {
      return res.status(400).json({ error: 'Invalid agent ID. Must be 1-5.' });
    }

    // Validate input
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Input text is required.' });
    }

    // Build the user message based on agent
    let userMessage = '';
    
    if (agentId === 1) {
      // Agent 1: Just needs the passage reference
      userMessage = `Please analyze this Biblical passage for oral translation into Hindi:\n\n${input}`;
    } else if (agentId === 2) {
      // Agent 2: Needs exegesis report
      userMessage = `Here is the exegesis report from Agent 1:\n\n${previousOutputs?.agent1 || ''}\n\nPlease produce an oral Hindi translation based on this analysis.`;
    } else if (agentId === 3) {
      // Agent 3: Needs translation and notes
      userMessage = `Here is the oral Hindi translation and translator's notes from Agent 2:\n\n${previousOutputs?.agent2 || ''}\n\nPlease review this translation for oral style and boundary compliance.`;
    } else if (agentId === 4) {
      // Agent 4: Needs all previous outputs
      userMessage = `Please verify the theological accuracy of this translation.\n\n## Exegesis Report (Agent 1):\n${previousOutputs?.agent1 || ''}\n\n## Oral Translation (Agent 2):\n${previousOutputs?.agent2 || ''}\n\n## Style Review (Agent 3):\n${previousOutputs?.agent3 || ''}`;
    } else if (agentId === 5) {
      // Agent 5: Needs approved script
      userMessage = `Here is the validated oral script approved by Agent 4:\n\n${previousOutputs?.agent4 || ''}\n\nOriginal translation with notes:\n${previousOutputs?.agent2 || ''}\n\nPlease prepare this for TTS rendering.`;
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({ apiKey });

    // Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: PROMPTS[agentId],
      messages: [
        { role: 'user', content: userMessage }
      ]
    });

    // Extract text response
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return res.status(200).json({
      success: true,
      agentId,
      agentName: AGENT_NAMES[agentId],
      output: responseText,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('Agent API error:', error);
    
    // Handle specific Anthropic errors
    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait and try again.' });
    }
    
    return res.status(500).json({ 
      error: 'Failed to process with Claude',
      details: error.message 
    });
  }
}
