import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Email from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

function requireEmailConfig() {
  const server = process.env.EMAIL_SERVER || "";
  const from = process.env.EMAIL_FROM || "";
  if (!server || !from) {
    throw new Error("EMAIL_SERVER/EMAIL_FROM is not configured");
  }
  return { server, from };
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider }) {
        const cfg = requireEmailConfig();
        const transport = nodemailer.createTransport(cfg.server);
        const { host } = new URL(url);
        await transport.sendMail({
          to: identifier,
          from: cfg.from,
          subject: `Sign in to ${host}`,
          text: `Sign in to ${host}\n${url}\n\n`,
          html: `<p>Sign in to <strong>${host}</strong></p><p><a href="${url}">Sign in</a></p>`,
        });
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt: ({ token, user }: { token: any; user?: any }) => {
      if (user?.id) token.id = user.id;
      return token;
    },
    session: ({ session, token }: { session: any; token: any }) => {
      if (session?.user) {
        session.user.id = token?.id || session.user.id;
        if (!session.user.email && token?.email) session.user.email = token.email;
      }
      return session;
    },
  },
};

const handler = (NextAuth as any)(authOptions);

export { handler as GET, handler as POST };
