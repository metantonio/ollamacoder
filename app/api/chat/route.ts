import { createMessage } from '@/app/(main)/actions';
import { getPrisma } from '@/lib/prisma';
import { appResponse } from '@/lib/response';
import { CoreMessage, streamText } from 'ai';
import { ollama } from 'ollama-ai-provider'

export async function POST(req: Request) {
  const { messages, model, chatId }: { messages: CoreMessage[], model: string, chatId: string } = await req.json();

  const result = streamText({
    model: ollama(model),
    system: 'You are a helpful assistant.',
    messages,
    onFinish: async ({ text }) => {
      await createMessage(
        chatId,
        text,
        "assistant",
      );
    },
  });

  return result.toDataStreamResponse();
}

export async function GET(req: Request) {

  return appResponse(async () => {
    const prisma = getPrisma();
    const chats = await prisma.chat.findMany({
      orderBy: { createdAt: "desc" }
    });
    return chats
  });
}

export async function DELETE(req: Request) {
  const { chatIds }: { chatIds: string[] } = await req.json();

  return appResponse(async () => {
    const prisma = getPrisma();
    const chats = await prisma.chat.deleteMany({
      where: {
        id: {
          in: chatIds
        }
      }
    });
    return chats
  });
}