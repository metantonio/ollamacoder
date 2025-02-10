import { createMessage } from '@/app/(main)/actions';
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