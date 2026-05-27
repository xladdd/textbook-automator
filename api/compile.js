// This is a Vercel Serverless Function
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send();
  
  const { prompt, files } = req.body;
  
  // Call OpenAI API
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt + JSON.stringify(files) }],
  });

  res.status(200).json({ result: completion.choices[0].message.content });
}