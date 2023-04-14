import { SignInButton, useUser } from "@clerk/nextjs"
import dayjs from "dayjs"
import { type NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { useRef, type FormEvent } from "react"
import { toast } from "react-hot-toast"
import { LoadingSpinner } from "~/components/LoadingSpinner"
import { api, type RouterOutputs } from "~/utils/api"
import { RootLayout } from "../layouts/Layout"

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
          alt={`${user.username || "your"} user avatar`}
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

type PostWithUser = RouterOutputs["posts"]["getAll"][number]
export const UserPost = ({ post }: { post: PostWithUser }) => {
  return (
    <div className="mb-3 flex flex-col" key={post.id}>
      <div className="flex rounded-t-lg bg-green-900 p-3">
        <Link href={`/${post.author.userName}`}>
          <Image
            src={post.author?.image}
            alt="Post's user avatar"
            className="mr-3 rounded-xl"
            width={50}
            height={50}
          />
        </Link>
        <div className="flex flex-col">
          <Link href={`/${post.author.userName}`}>
            <p className="text-md">{post.author.userName}</p>
          </Link>

          <Link href={`/post/${post.id}`}>
            <p className="text-xs text-slate-300 opacity-75">
              @{" "}
              {dayjs(post.dateCreated).format("YYYY-MM-DD hh:mm a").toString()}
            </p>
          </Link>
        </div>
      </div>

      <Link href={`/post/${post.id}`}>
        <p className="rounded-b-lg bg-green-950 p-3 text-xl">{post.content}</p>
      </Link>
    </div>
  )
}

const Home: NextPage = () => {
  const user = useUser()

  const { data: posts, isLoading } = api.posts.getAll.useQuery()

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner size={70} />
      </div>
    )
  }

  if (!posts) {
    return <div>Something went wrong while retrieving posts.</div>
  }

  return (
    <>
      <Head>
        <title>Twitter Emoji</title>
        <meta
          name="description"
          content="Mini Twitter clone created by Jordan Winslow complete with network rate limiting, user auth, intelligent errors with schema validation, an intelligent caching layer and much more!"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
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
          {posts.map((post) => (
            <UserPost post={post} key={post.id} />
          ))}
        </div>
      </RootLayout>
    </>
  )
}

export default Home
