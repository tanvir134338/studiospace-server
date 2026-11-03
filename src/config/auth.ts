import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { client } from "./db.js";

export const auth = betterAuth({
  database: mongodbAdapter(client.db("studiospace"), {
    client,
  }),

  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins: [
    "http://localhost:3000",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      disableImplicitSignUp: true,
    },
  },
});
