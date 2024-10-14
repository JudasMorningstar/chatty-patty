import { auth } from "@/server/auth";
import { getChatsByUserId } from "@/server/db/queries";

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json("Unauthorized!", { status: 401 });
  }

  const chats = await getChatsByUserId({ id: session.user.id! });
  return Response.json(chats);
}
