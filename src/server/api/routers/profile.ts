import { clerkClient } from "@clerk/nextjs/server"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"
import { filterUserProperties } from "../util/filterUserProperties"

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const user = await clerkClient.users.getUserList({
        username: [input.username],
      })

      // probably check other accounts here if none found
      if (user[0]) {
        return filterUserProperties(user[0])
      } else
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User ${input.username} not found.`,
        })
    }),
})
