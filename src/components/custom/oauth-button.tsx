import { useTransition } from "react";

import { handleSignIn } from "@/app/(auth)/actions";

import { Button } from "../ui/button";
import { Icons } from "../ui/icons";

interface OAuthSignInButtonProps {
  provider: "discord" | "github";
  icon?: keyof typeof Icons;
}

export default function OAuthSignInButton({
  provider,
  icon,
}: OAuthSignInButtonProps) {
  const [isPending, startTransition] = useTransition();
  const Icon = icon ? Icons[icon] : Icons.gitHub;
  return (
    <form className="w-full">
      <Button
        variant="outline"
        className="w-full"
        disabled={isPending}
        formAction={() => {
          startTransition(async () => {
            await handleSignIn(provider);
          });
        }}
      >
        {isPending && <Icons.spinner className="mr-2 size-4 animate-spin" />}
        <Icon className="mr-2 size-4" />{" "}
        <span className="capitalize">{provider}</span>
      </Button>
    </form>
  );
}
