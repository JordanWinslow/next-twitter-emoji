import { clerkClient } from "@clerk/nextjs/server"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import {
  createTRPCRouter,
  privateProcedure,
  //privateProcedure,
  publicProcedure,
} from "~/server/api/trpc"

const postInputSchema = z.object({
  content: z
    .string()
    .min(1, "Please type at least one emoji")
    .max(280, "Please type less than 100 emojis")
    .emoji("Only emojis are allowed!"),
})

import { Ratelimit } from "@upstash/ratelimit" // for deno: see above
import { Redis } from "@upstash/redis"
import { filterUserProperties } from "../util/filterUserProperties"

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
})

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: { dateCreated: "desc" },
    })

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
      })
    ).map(filterUserProperties)

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId)
      if (!author) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No author found for post",
        })
      }
      return {
        ...post,
        author,
      }
    })
  }),
  createPost: privateProcedure
    .input(postInputSchema)
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId

      const { success } = await ratelimit.limit(authorId)

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Please slow down, you are posting too fast.",
        })
      }

      const content = input.content

      return await ctx.prisma.post.create({ data: { authorId, content } })
    }),
})
