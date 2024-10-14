import { skipCSRFCheck } from "@auth/core";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { compare } from "bcrypt-ts";
import { eq } from "drizzle-orm";
import { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import GitHub from "next-auth/providers/github";

import { env } from "@/env";
import { authSchema } from "@/lib/validators/auth";

import { db } from "./db";
import { getAccountByUserId, getUser, getUserById } from "./db/queries";
import { users, accounts, sessions, verificationTokens } from "./db/schema";

import type {
  DefaultSession,
  NextAuthConfig,
  Session as NextAuthSession,
} from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

const adapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
}) as Adapter;

export const isSecureContext = env.NODE_ENV !== "development";

export const authConfig = {
  adapter,
  // In development, we need to skip checks to allow Expo to work
  ...(!isSecureContext
    ? {
        skipCSRFCheck: skipCSRFCheck,
        trustHost: true,
      }
    : {}),
  secret: env.AUTH_SECRET,

  providers: [
    Discord,
    GitHub,
    Credentials({
      async authorize(credentials) {
        const validatedField = authSchema.safeParse(credentials);

        if (validatedField.success) {
          let { email, password } = validatedField.data;
          let users = await getUser(email);
          if (users.length === 0) return null;
          let passwordsMatch = await compare(password, users[0].password!);
          if (passwordsMatch) return users[0];
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      let isLoggedIn = !!auth?.user;
      let isOnChat = nextUrl.pathname.startsWith("/");
      let isOnRegister = nextUrl.pathname.startsWith("/register");
      let isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL("/", nextUrl));
      }

      if (isOnRegister || isOnLogin) {
        return true; // Always allow access to register and login pages
      }

      if (isOnChat) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email!;
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;
      const existingAccount = await getAccountByUserId(existingUser.id);
      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      return token;
    },
  },
  events: {
    async linkAccount({ user }) {
      await db
        .update(users)
        .set({
          emailVerified: new Date(),
        })
        .where(eq(users.id, user.id as string));
    },
  },
  session: { strategy: "jwt" },
  debug: false,
} as NextAuthConfig;

export const validateToken = async (
  token: string
): Promise<NextAuthSession | null> => {
  const sessionToken = token.slice("Bearer ".length);
  const sessionAndUser = await adapter.getSessionAndUser?.(sessionToken);

  if (!sessionAndUser) return null;

  const { session, user } = sessionAndUser;

  // Fetch additional user data if needed
  const extendedUser = await getUserById(user.id);

  if (!extendedUser) return null;

  return {
    user: {
      id: extendedUser.id,
      name: extendedUser.name,
      email: extendedUser.email,
      image: extendedUser.image,
    },
    expires: session.expires.toISOString(),
  };
};

export const invalidateSessionToken = async (token: string) => {
  await adapter.deleteSession?.(token);
};
