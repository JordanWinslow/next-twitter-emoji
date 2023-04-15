import { SignInButton, UserButton, useUser } from "@clerk/nextjs"
import dayjs from "dayjs"
import { type NextPage } from "next"
import Image from "next/image"
import Link from "next/link"
import { useRef, type FormEvent } from "react"
import { toast } from "react-hot-toast"
import { LoadingSpinner } from "~/components/LoadingSpinner"
import { RootLayout } from "~/layouts/RootLayout"
import { api, type RouterOutputs } from "~/utils/api"

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
      <div className="flex w-full items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: {
                width: 90,
                height: 90,
                borderRadius: "20px",
                "&:focus": { borderRadius: "20px" },
              },
            },
          }}
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

export function Footer() {
  return (
    <div className="flex items-center justify-between p-4 text-xl">
      <a href="https://github.com/JordanWinslow/next-twitter-emoji">
        <div className="flex items-center justify-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <div>Github</div>
        </div>
      </a>
      <span>
        <a href="https://JordanWinslow.dev">Jordan&apos;s Portfolio</a>
      </span>
    </div>
  )
}
const Home: NextPage = () => {
  const user = useUser()

  console.log("USER ON HOME PAGE: ", user)
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
      <RootLayout>
        <div className="flex border-b-2 border-green-900 p-4">
          {user.isSignedIn ? (
            <CreatePostForm />
          ) : (
            <div className="flex justify-center">
              <SignInButton mode="modal" />
            </div>
          )}
        </div>

        <div className="overflow-scroll p-8">
          {posts.map((post) => (
            <UserPost post={post} key={post.id} />
          ))}
        </div>

        <Footer />
      </RootLayout>
    </>
  )
}

export default Home
