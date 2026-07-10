import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // In production, compare hashed passwords from a secure store.
        if (!credentials || !credentials.password) return null;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
        if (credentials.password === ADMIN_PASSWORD) {
          return { id: "admin", name: "Admin" };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    // Use the admin page as the sign-in page so users land on /admin
    signIn: "/admin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user as any;
      return token;
    },
    async session({ session, token }) {
      // Attach the small user object to session for server use
      (session as any).user = (token as any).user;
      return session;
    },
  },
};

// Helper to get the JWT token on the server (works in API routes/middleware)
export async function getServerAuth(req: Request) {
  // dynamic import to avoid loading next-auth/jwt on the client
  const { getToken } = await import("next-auth/jwt");
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  return token;
}
