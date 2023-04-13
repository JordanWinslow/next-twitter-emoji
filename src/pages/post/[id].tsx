import { SignInButton, useUser } from "@clerk/nextjs"
import { createProxySSGHelpers } from "@trpc/react-query/ssg"
import dayjs from "dayjs"
import { type GetStaticProps, type NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import { useRef, type FormEvent } from "react"
import { toast } from "react-hot-toast"
import superjson from "superjson"
import { RootLayout } from "~/Layouts/Layout"
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

const CreatePostForm = () => {
  const { user, isLoaded } = useUser()
  const ctx = api.useContext()

  const { mutate: createPost, isLoading: isPosting } =
    api.posts.createPost.useMutation({
      onError: (error) => {
        console.dir(error)
        const apiErrorMessage =
          error.data?.zodError?.fieldErrors.content?.[0] || error.shape?.message
        const defaultErrorMessage =
          "Error posting, please ensure you are posting 1 or more emojis. No numbers or text is allowed!"

        toast.error(apiErrorMessage || defaultErrorMessage)
      },
      onSuccess: () => {
        if (inputRef.current) {
          inputRef.current.value = ""
        }
        void ctx.posts.invalidate()
      },
    })

  const inputRef = useRef<HTMLInputElement>(null)
  // would replace this with a form library like finalform or react-hook-form
  // if this was a real production app
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (inputRef.current) {
      createPost({ content: inputRef.current.value })
    }
  }

  if (!isLoaded) {
    return <LoadingSpinner />
  } else if (!user) {
    return (
      <div>
        Something went wrong logging you in, please refresh and try again
      </div>
    )
  } else {
    return (
      <div className="flex w-full items-center">
        <Image
          src={user.profileImageUrl}
          alt={`@${user.username || "your"} user avatar`}
          className="rounded-xl"
          width={90}
          height={90}
        />
        <form className="flex grow" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            name="content"
            placeholder="Post some emojis!"
            className="mx-4 grow rounded-lg bg-gradient-to-r from-black to-green-950 p-3 text-green-500  outline-none"
          />
          <button
            className="rounded-lg bg-green-900 px-3"
            type="submit"
            disabled={isPosting}
          >
            {!isPosting ? "Post" : <LoadingSpinner size={17} />}
          </button>
        </form>
      </div>
    )
  }
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
        <div className="flex border-b-2 border-green-900 p-4">
          {user.isSignedIn ? (
            <CreatePostForm />
          ) : (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
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
