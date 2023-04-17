import { useUser } from "@clerk/nextjs"
import { createProxySSGHelpers } from "@trpc/react-query/ssg"
import dayjs from "dayjs"
import { type GetStaticProps, type NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import superjson from "superjson"
import { RootLayout } from "~/layouts/RootLayout"
import { appRouter } from "~/server/api/root"
import { prisma } from "~/server/db"
import { api, type RouterOutputs } from "~/utils/api"

const LoadingSpinner = ({ size }: { size?: number }) => {
  return (
    <div
      className="inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-green-400 motion-reduce:animate-[spin_1.5s_linear_infinite]"
      style={size ? { height: size, width: size } : undefined}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  )
}

type PostWithUser = RouterOutputs["posts"]["getByPostId"]
const UserPost = ({ post }: { post: PostWithUser }) => {
  if (!post) return null

  return (
    <div className="mb-3 flex flex-col" key={post.id}>
      <div className="flex rounded-t-lg bg-green-900 p-3">
        <Image
          src={post.author?.image}
          alt="Post's user avatar"
          className="mr-3 rounded-xl"
          width={50}
          height={50}
        />
        <div className="flex flex-col">
          <p className="text-md">{post.author.userName}</p>
          <p className="text-xs text-slate-300 opacity-75">
            @ {dayjs(post.dateCreated).format("YYYY-MM-DD hh:mm a").toString()}
          </p>
        </div>
      </div>

      <p className="rounded-b-lg bg-green-950 p-3 text-xl">{post.content}</p>
    </div>
  )
}

interface IPostPageProps {
  postId: string
}

const PostPage: NextPage<IPostPageProps> = (props) => {
  const user = useUser()

  const { data: post, isLoading } = api.posts.getByPostId.useQuery({
    id: props.postId,
  })

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner size={70} />
      </div>
    )
  }

  if (!post) {
    return <div>Something went wrong while retrieving posts.</div>
  }

  return (
    <>
      <Head>
        <title>Twitter Emoji User Post Page</title>
      </Head>

      <RootLayout>
        <div className="relative mb-20 h-32 flex-none bg-green-900">
          <Image
            src={post.author.image}
            alt={`${post.author.userName} Profile Image`}
            width={130}
            height={130}
            className="absolute bottom-0 left-0 -mb-16 ml-10 rounded-lg border-2 border-black"
          />
        </div>

        <div className="mx-10">
          <div className="text-2xl font-bold">{`${
            post.author.firstName || ""
          } ${post.author.lastName || ""}`}</div>
          <div className="border-b-2 border-green-800 pb-3">
            @{post.author.userName}
          </div>
        </div>

        <div className="overflow-scroll p-8">
          <UserPost post={post} />
        </div>
      </RootLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  })

  const slug = context.params?.id

  if (slug === undefined || typeof slug !== "string") throw new Error("No slug")

  // fetch user on server side and hydrate it via server side props
  await ssg.posts.getByPostId.prefetch({ id: slug })

  return {
    props: {
      // ensure query data is present in react-query context and not just
      // fetched and processed exclusively on server side
      trpcState: ssg.dehydrate(),
      postId: slug,
    },
  }
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" }
}

export default PostPage
