import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { organization } from "better-auth/plugins";
import { db } from "@repo/database";
import * as schema from "@repo/database/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.usersTable,
      session: schema.sessionTable,
      account: schema.accountTable,
      verification: schema.verificationTable,
      organization: schema.organizationTable,
      member: schema.memberTable,
      invitation: schema.invitationTable,
    },
  }),
  user: {
    fields: {
      name: "fullName",
      image: "profileImageUrl",
    },
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
    }),
  ],
});
