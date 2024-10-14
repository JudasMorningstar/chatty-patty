import { auth } from "@/server/auth";

import { History } from "./history";
import { UserNav } from "./user-nav";

export const Navbar = async () => {
  let session = await auth();

  return (
    <>
      <div className="bg-background absolute top-0 left-0 w-dvw py-2 px-3 justify-between flex flex-row items-center z-30">
        <div className="flex flex-row gap-3 items-center">
          <History user={session?.user} />
          <div className="flex flex-row gap-2 items-center">
            <div className="text-sm dark:text-zinc-300">Chatty-Patty</div>
          </div>
        </div>

        <UserNav />
      </div>
    </>
  );
};
