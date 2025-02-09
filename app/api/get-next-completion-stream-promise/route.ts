import { streamText } from 'ai';
import { ollama } from 'ollama-ai-provider'
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const prisma = getPrisma();

  const { messageId, model } = await req.json();

  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    return new Response(null, { status: 404 });
  }

  const messagesRes = await prisma.message.findMany({
    where: { chatId: message.chatId, position: { lte: message.position } },
    orderBy: { position: "asc" },
  });

  let messages = z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
      }),
    )
    .parse(messagesRes);

  if (messages.length > 10) {
    messages = [messages[0], messages[1], messages[2], ...messages.slice(-7)];
  }


  const result = streamText({
    model: ollama(model),
    system: 'You are a helpful assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}

// export const runtime = "edge";
export const maxDuration = 45;
