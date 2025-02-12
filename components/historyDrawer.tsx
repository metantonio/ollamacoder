"use client"

import { ArrowRightIcon, History } from "lucide-react";
import Link from "next/link";
import { ApiResponse } from "@/lib/response";
import { useEffect, useState } from "react";
import { Chat } from "@prisma/client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function HistoryDrawer() {
  const [chats, setChats] = useState<Chat[]>([])
  useEffect(() => {
    fetch(
      "/api/chat",
    ).then((res) => {
      return res.json();
    }).then((data: ApiResponse<Chat[]>) => {
      if (data.data) {
        setChats(data.data)
      }
    }).catch(e => {
      console.error(e)
    });
  }, [])
  return (
    <Sheet>
      <SheetTrigger asChild>
        <History className="cursor-pointer" />
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto h-auto bg-white pb-0">
        <SheetHeader className="mb-2">
          <SheetTitle>Recent Chats</SheetTitle>
        </SheetHeader>
        <div className="max-w-md mx-auto flex-1">
          {chats.map((chat, index) => (
            <Link href={`/chats/${chat.id}`} key={chat.id}
              className="mb-2 flex gap-2 items-center last:mb-0 last:pb-0"
            >
              <span className="flex h-2 w-2 rounded-full bg-sky-500" />
              <span className="text-sm font-medium flex-1 truncate">
                {chat.title}
              </span>
              <ArrowRightIcon />
            </Link>
          ))}
        </div>
        <SheetFooter className="sticky bottom-0 w-full bg-white">
          <SheetClose asChild>
            <Link href={`/history`}
              className="mt-2 flex gap-2 items-center justify-between text-blue-500"
            >
              <span className="text-sm font-medium leading-none flex-1">
                View All
              </span>
              <ArrowRightIcon />
            </Link>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

