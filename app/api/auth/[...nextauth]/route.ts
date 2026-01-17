import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Email from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session: ({ session, user }: { session: any; user: any }) => {
      if (session?.user) session.user.id = user.id;
      return session;
    },
  },
};

const handler = (NextAuth as any)(authOptions);

export { handler as GET, handler as POST };
