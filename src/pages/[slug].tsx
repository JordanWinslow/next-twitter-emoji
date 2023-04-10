import { createProxySSGHelpers } from "@trpc/react-query/ssg"
import { type GetStaticProps, type NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import superjson from "superjson"
import { appRouter } from "~/server/api/root"
import { prisma } from "~/server/db"
import { api } from "~/utils/api"
import { UserPost } from "."
import { RootLayout } from "./Layout"

interface IUserProfilePageProps {
  username: string
}

const UserProfilePage: NextPage<IUserProfilePageProps> = (props) => {
  const { data: profile, isLoading } = api.profile.getUserByUsername.useQuery({
    username: "jordanwinslow",
  })

  if (!profile) {
    return <div>Loading...</div>
  }

  const { data: posts, isLoading: postsLoading } =
    api.posts.getByUserId.useQuery({ userId: profile.id })

  return (
    <>
      <Head>
        <title>{`${profile.userName}'s Profile`}</title>
      </Head>
      <RootLayout>
        <div className="relative mb-24 h-48 bg-green-900">
          <Image
            src={profile.image}
            alt={`${profile.userName} Profile Image`}
            width={170}
            height={170}
            className="absolute bottom-0 left-0 -mb-20 ml-10 rounded-lg border-2 border-black"
          />
        </div>

        <div className="text-2xl font-bold">{`${profile.firstName || ""} ${
          profile.lastName || ""
        }`}</div>
        <div className="border-b-2 border-green-800 pb-3">
          @{profile.userName}
        </div>
        <div className="overflow-scroll p-8">
          {posts?.map((post) => (
            <UserPost post={post} key={post.id} />
          ))}
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

  const slug = context.params?.slug

  if (slug === undefined || typeof slug !== "string") throw new Error("No slug")

  // fetch user on server side and hydrate it via server side props
  await ssg.profile.getUserByUsername.prefetch({ username: slug })

  return {
    props: {
      // ensure query data is present in react-query context and not just
      // fetched and processed exclusively on server side
      trpcState: ssg.dehydrate(),
      username: slug,
    },
  }
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" }
}

export default UserProfilePage
