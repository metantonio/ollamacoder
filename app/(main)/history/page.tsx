"use client"

import Link from "next/link";
import { ApiResponse } from "@/lib/response";
import { useEffect, useState } from "react";
import { Chat } from "@prisma/client";
import { formatDate } from "@/lib/date";


import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";


const FormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
})

export default function History() {
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([])
  const [editMode, setEditMode] = useState(false)

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

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: [],
    },
  })

  const removeChats = async function () {
    fetch(
      "/api/chat",
      {
        method: "DELETE",
        body: JSON.stringify({ ids: form.getValues("items") })
      }
    ).then((res) => {
      return res.json();
    }).then((data: ApiResponse<Chat[]>) => {
      if (data.data) {
        setChats(data.data)
      }
    }).catch(e => {
      console.error(e)
    });
  }
  return (
    <div className="container mx-auto py-4">
      {editMode ? (
        <div className="flex justify-between items-center">
          You have selected {form.getValues("items").length} chats
          <div className="flex items-center gap-2">
            <Button
              variant="link"
              className="text-blue-500"
              onClick={() => {
                form.setValue("items", chats.map(chat => chat.id))
              }}>Select All
            </Button>
            <Button
              onClick={() => {
                form.setValue("items", [])
                setEditMode(false)
              }} >Cancel</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="text-white bg-red-500 hover:bg-red-600">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    chats from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={removeChats}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ) : (
        <div>
          You have {chats.length} previous chats
          <Button variant="link" className="text-blue-500" onClick={() => setEditMode(true)}>Select</Button>
        </div>
      )}
      <Form {...form}>
        <form className="space-y-8 mt-4" onChange={(data) => {
          const selects = form.getValues("items")
          setEditMode(selects.length > 0)
        }}>
          <FormField
            control={form.control}
            name="items"
            render={() => (
              <FormItem>
                {chats.map((chat) => (
                  <FormField
                    key={chat.id}
                    control={form.control}
                    name="items"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={chat.id}
                          className="flex flex-row items-center space-y-0 group rounded shadow w-full p-2 border relative cursor-pointer"
                        >
                          <FormControl className={cn("group-hover:visible absolute -left-2", editMode ? "" : "invisible")}>
                            <Checkbox
                              className="check:bg-white"
                              checked={field.value?.includes(chat.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, chat.id])
                                  : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== chat.id
                                    )
                                  )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="w-full cursor-pointer">
                            <div
                              onClick={(e) => {
                                if (!editMode) {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  router.push(`/chats/${chat.id}`);
                                }
                              }}>
                              <div>
                                {chat.title}
                              </div>
                              <div className="text-xs leading-none text-gray-500 mt-2 text-neutral-500">
                                {formatDate(chat.createdAt.valueOf())}
                              </div>
                            </div>
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}

// export const runtime = "edge";
export const maxDuration = 45;
