import { handleChat } from './_lib/study-api-core';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const result = await handleChat(req.body);
    return res.status(result.status).json(result.payload);
  } catch (error: any) {
    console.error('[api/chat] failed:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
