import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const { task, data } = req.body;
  
  // Load the prompt dynamically based on the task
  const promptFile = task === 'manifest' ? 'manifest_prompt.md' : 'script_prompt.md';
  const systemPrompt = fs.readFileSync(path.join(process.cwd(), 'prompts', promptFile), 'utf-8');

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Process this data: ${JSON.stringify(data)}` }
      ],
    });

    res.status(200).json({ output: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}