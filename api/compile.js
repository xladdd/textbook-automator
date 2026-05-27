import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function chatWithRetry(messages, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
      });
    } catch (err) {
      if (err.status === 429 && i < retries - 1) {
        console.log(`[Backend] Rate limited. Retrying...`);
        await new Promise(res => setTimeout(res, 2000 * (i + 1)));
      } else {
        throw err;
      }
    }
  }
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { task, data } = req.body;
    console.log("[Backend] Task:", task);

    const promptFile = task === 'manifest' ? 'manifest_prompt.md' : 'script_prompt.md';
    const promptPath = path.join(process.cwd(), 'prompts', promptFile);
    const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

    const completion = await chatWithRetry([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Process: ${JSON.stringify(data)}` }
    ]);

    res.status(200).json({ output: completion.choices[0].message.content });
  } catch (err) {
    console.error("[Backend Error]", err.message);
    res.status(500).json({ error: err.message });
  }
}