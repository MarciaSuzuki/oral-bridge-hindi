import Anthropic from '@anthropic-ai/sdk';

const LEARNING_SYSTEM_PROMPT = `You distill user edits into durable, generalizable preferences for a translation agent.

Rules:
- Output 1-6 concise bullet points.
- Each bullet is a short imperative rule (no extra commentary).
- Focus on stable preferences (style, terminology, structure), not one-off wording.
- If there are no meaningful changes, output exactly: NO_LEARNING`;

const truncateText = (text, limit = 8000) => {
  const str = String(text || '');
  if (str.length <= limit) return str;
  const head = Math.floor(limit * 0.6);
  const tail = Math.floor(limit * 0.4);
  return `${str.slice(0, head)}\n...[truncated]...\n${str.slice(str.length - tail)}`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY not configured. Add it in Vercel environment variables.'
    });
  }

  try {
    const { agentId, original, edited } = req.body;

    if (!agentId || agentId < 1 || agentId > 5) {
      return res.status(400).json({ error: 'Invalid agent ID. Must be 1-5.' });
    }

    if (!original || !edited || typeof original !== 'string' || typeof edited !== 'string') {
      return res.status(400).json({ error: 'Original and edited outputs are required.' });
    }

    if (original.trim() === edited.trim()) {
      return res.status(200).json({ learning: null });
    }

    const anthropic = new Anthropic({ apiKey });

    const userContent = `AGENT: ${agentId}\n\nORIGINAL:\n<<<\n${truncateText(original)}\n>>>\n\nEDITED:\n<<<\n${truncateText(edited)}\n>>>`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: LEARNING_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userContent }
      ]
    });

    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim();

    if (!responseText || responseText.toUpperCase().includes('NO_LEARNING')) {
      return res.status(200).json({ learning: null });
    }

    return res.status(200).json({ learning: responseText });
  } catch (error) {
    console.error('Learning API error:', error);

    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait and try again.' });
    }

    return res.status(500).json({
      error: 'Failed to generate learning summary',
      details: error.message
    });
  }
}
