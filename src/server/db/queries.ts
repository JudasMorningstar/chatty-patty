"server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq, and } from "drizzle-orm";

import { users, chat, User, accounts } from "./schema";

import { db } from ".";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
// let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`, {
//   max: 1,
// });
// let db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(users).where(eq(users.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export const getUserById = async (id: string) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id)));

    return user[0] ?? null;
  } catch {
    return null;
  }
};

export const getAccountByUserId = async (userId: string) => {
  try {
    // const account = await db.query.accounts.findFirst({
    //   where: (fields) => and(eq(fields.userId, userId)),
    // });

    const account = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId)));
    return account[0] ?? null;
  } catch (error) {
    return null;
  }
};

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  try {
    return await db.insert(users).values({ email, password: hash });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id));
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages: JSON.stringify(messages),
      userId,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}
