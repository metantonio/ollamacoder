"use server";

import ollama from 'ollama'
import { getPrisma } from "@/lib/prisma";
import {
  getMainCodingPrompt,
  screenshotToCodePrompt,
  softwareArchitectPrompt,
} from "@/lib/prompts";
import { notFound } from "next/navigation";

const llmModel = "phi:latest"

export async function createChat(
  id: string,
  prompt: string,
  model: string = llmModel,
  quality: "high" | "low",
  screenshotUrl: string | undefined,
) {
  const prisma = getPrisma();
  const chat = await prisma.chat.create({
    data: {
      id,
      model,
      quality,
      prompt,
      title: "",
      shadcn: true,
    },
  });

  async function fetchTitle() {
    const responseForChatTitle = await ollama.chat({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a chatbot helping the user create a simple app or script, and your current job is to create a succinct title, maximum 3-5 words, for the chat given their initial prompt. Please return only the title.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const title = responseForChatTitle?.message.content || prompt;
    return title;
  }

  async function fetchTopExample() {
    const findSimilarExamples = await ollama.chat({
      model,
      messages: [
        {
          role: "system",
          content: `You are a helpful bot. Given a request for building an app, you match it to the most similar example provided. If the request is NOT similar to any of the provided examples, return "none". Here is the list of examples, ONLY reply with one of them OR "none":

          - landing page
          - blog app
          - quiz app
          - pomodoro timer
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const mostSimilarExample =
      findSimilarExamples?.message.content || "none";
    return mostSimilarExample;
  }
  const [title, mostSimilarExample] = await Promise.all([
    fetchTitle(),
    fetchTopExample(),
  ]);

  let fullScreenshotDescription;
  if (screenshotUrl) {
    const screenshotResponse = await ollama.chat({
      model: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
      // max_tokens: 1000,
      messages: [
        {
          role: "user",
          images: [screenshotUrl],
          content: screenshotToCodePrompt,
        },
      ],
      options: {
        temperature: 0.2,
      }
    });
    fullScreenshotDescription = screenshotResponse?.message?.content;
  }

  let userMessage: string;
  if (quality === "high") {
    let initialRes = await ollama.chat({
      model,
      messages: [
        {
          role: "system",
          content: softwareArchitectPrompt,
        },
        {
          role: "user",
          content: fullScreenshotDescription
            ? fullScreenshotDescription + prompt
            : prompt,
        },
      ],
      options: {
        temperature: 0.2,
      },
      // max_tokens: 3000,
    });

    userMessage = initialRes?.message?.content ?? prompt;
  } else if (fullScreenshotDescription) {
    userMessage =
      prompt +
      "RECREATE THIS APP AS CLOSELY AS POSSIBLE: " +
      fullScreenshotDescription;
  } else {
    userMessage = prompt;
  }

  let newChat = await prisma.chat.update({
    where: {
      id: chat.id,
    },
    data: {
      title,
      messages: {
        createMany: {
          data: [
            {
              role: "system",
              content: getMainCodingPrompt(mostSimilarExample?.trim().replaceAll("\/n", "")),
              position: 0,
            },
            { role: "user", content: userMessage, position: 1 },
          ],
        },
      },
    },
    include: {
      messages: true,
    },
  });

  const lastMessage = newChat.messages
    .sort((a, b) => a.position - b.position)
    .at(-1);
  if (!lastMessage) throw new Error("No new message");

  return {
    chat: chat,
    messages:newChat.messages,
    lastMessageId: lastMessage.id,
  };
}

export async function createMessage(
  chatId: string,
  text: string,
  role: "assistant" | "user",
) {
  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });
  if (!chat) notFound();

  const maxPosition = Math.max(...chat.messages.map((m) => m.position));

  const newMessage = await prisma.message.create({
    data: {
      role,
      content: text,
      position: maxPosition + 1,
      chatId,
    },
  });

  return newMessage;
}
