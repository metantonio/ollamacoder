### todo
1. persistence messages with [*streamText onFinish callback*](https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot-message-persistence) instead of *createMessage*

### tips
1. ollama doesn't support edge runtime(it does't support Nodejs fs,http)
2. neon is serverless postgres provider,so disable the neon adapter in development
