import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { client } from "./db.js";

export const auth = betterAuth({
  database: mongodbAdapter(client.db("studiospace"), {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },
});
