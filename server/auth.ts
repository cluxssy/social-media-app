import { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import { storage } from "./storage";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      username: string;
    } & DefaultSession["user"]
  }
}

// Extend the built-in user type
declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    username: string;
  }
}

// Read environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const twitterClientId = process.env.TWITTER_CLIENT_ID || "";
const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET || "";
const nextAuthSecret = process.env.NEXTAUTH_SECRET || "";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
    TwitterProvider({
      clientId: twitterClientId,
      clientSecret: twitterClientSecret,
      version: "2.0",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Find user in the database
          const user = await storage.getUserByUsername(credentials.username);

          // Check if user exists and password matches
          if (user && user.password === credentials.password) {
            // Return user without the password
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  secret: nextAuthSecret,
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") {
        return true;
      }

      // For social logins, we need to check if the user exists
      // If not, create a new user
      try {
        if (account && profile) {
          // Try to find user by email
          let existingUser = profile.email 
            ? await storage.getUserByEmail(profile.email)
            : null;

          if (!existingUser) {
            // Create new user
            const username = generateUsername(profile);
            const email = profile.email || `${account.providerAccountId}@${account.provider}.com`;
            const fullName = profile.name || username;
            
            const newUser = await storage.createUser({
              username,
              email,
              fullName,
              profileImage: profile.image || null,
              provider: account.provider,
              providerId: account.providerAccountId,
              password: null, // Social login users don't have a password
            });
            
            return true;
          }

          // Update existing user with provider info if they don't have it
          if (!existingUser.provider) {
            // TODO: Update user with provider info
          }

          return true;
        }
      } catch (error) {
        console.error("Social login error:", error);
        return false;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Add user data to token when signing in
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      
      // Add provider info to token
      if (account) {
        token.provider = account.provider;
      }
      
      return token;
    },
    async session({ session, token }) {
      // Add user data to session
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

// Helper function to generate a username from profile
function generateUsername(profile: any): string {
  const base = profile.name 
    ? profile.name.replace(/\s+/g, '').toLowerCase() 
    : profile.email 
      ? profile.email.split('@')[0].toLowerCase()
      : 'user';
  
  // Add random numbers to ensure uniqueness
  return `${base}${Math.floor(Math.random() * 10000)}`;
}