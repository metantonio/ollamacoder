import ollama from 'ollama'
import { appResponse } from '@/lib/response'

export async function GET(request: Request) {
  return appResponse(async () => {
    const res = await ollama.list();
    return res.models;
  });
}
