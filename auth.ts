import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { ApiError, authApi } from "@/lib/api/auth-client";

// Auth.js redirects thrown-CredentialsSignin subclasses back to the client
// with `code` set to this instance property — this is how our backend's
// error.code (INVALID_CREDENTIALS, EMAIL_NOT_VERIFIED, RATE_LIMITED, ...)
// survives the round trip instead of collapsing into a generic failure.
class LoginError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

// The backend rotates refresh tokens on every use, so the old one is dead
// the moment this call returns — the new pair below is the only valid one.
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const refreshed = await authApi.refresh(token.refreshToken);
    return {
      ...token,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        rememberMe: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          throw new LoginError("VALIDATION_ERROR");
        }

        try {
          const tokens = await authApi.login({
            email,
            password,
            remember_me: credentials?.rememberMe === "true",
          });

          return {
            id: tokens.id,
            email: tokens.email,
            name: [tokens.first_name, tokens.last_name].filter(Boolean).join(" "),
            firstName: tokens.first_name,
            lastName: tokens.last_name,
            phoneNumber: tokens.phone_number,
            userType: tokens.user_type,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            accessTokenExpires: Date.now() + tokens.expires_in * 1000,
            braider: tokens.braider,
          };
        } catch (error) {
          throw new LoginError(
            error instanceof ApiError ? error.code : "UNKNOWN_ERROR"
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          // authorize() always returns a defined id (from UserPublic.id);
          // the base NextAuth `User` type just declares it optional.
          id: user.id as string,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          userType: user.userType,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          braider: user.braider,
        };
      }

      // Refresh a minute early so an in-flight request never races expiry.
      if (Date.now() < token.accessTokenExpires - 60_000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.phoneNumber = token.phoneNumber;
      session.user.userType = token.userType;
      session.accessToken = token.accessToken;
      session.braider = token.braider;
      session.error = token.error;
      return session;
    },
  },
});
