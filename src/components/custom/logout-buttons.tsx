"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { handleSignout } from "@/app/(auth)/actions";

import { Button } from "../ui/button";
import { Icons } from "../ui/icons";

export default function LogOutButtons() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <form>
      <div className="flex w-full items-center space-x-2">
        <Button
          disabled={isPending}
          className="w-full"
          formAction={() => {
            startTransition(async () => {
              await handleSignout().then(() => {
                router.push("/signin");
              });
            });
          }}
        >
          {isPending && <Icons.spinner className="mr-2 size-4 animate-spin" />}
          Sign out
        </Button>
        <Button
          aria-label="Go back to the previous page"
          variant="outline"
          className="w-full"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Go back
        </Button>
      </div>
    </form>
  );
}
