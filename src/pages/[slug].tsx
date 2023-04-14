import { createProxySSGHelpers } from "@trpc/react-query/ssg"
import { type GetStaticProps, type NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import superjson from "superjson"
import { RootLayout } from "~/layouts/RootLayout"
import { appRouter } from "~/server/api/root"
import { prisma } from "~/server/db"
import { api } from "~/utils/api"
import { UserPost } from "."

interface IUserProfilePageProps {
  username: string
}

const UserProfilePage: NextPage<IUserProfilePageProps> = (props) => {
  const { data: profile } = api.profile.getUserByUsername.useQuery({
    username: props.username,
  })

  if (!profile) {
    return <div>Loading...</div>
  }

  const { data: posts } = api.posts.getByUserId.useQuery({ userId: profile.id })

  return (
    <>
      <Head>
        <title>{`${profile.userName}'s Profile`}</title>
      </Head>

      <RootLayout>
        <div className="relative mb-20 h-full bg-green-900">
          <Image
            src={profile.image}
            alt={`${profile.userName} Profile Image`}
            width={130}
            height={130}
            className="absolute bottom-0 left-0 -mb-16 ml-10 rounded-lg border-2 border-black"
          />
        </div>

        <div className="mx-10">
          <div className="text-2xl font-bold">{`${profile.firstName || ""} ${
            profile.lastName || ""
          }`}</div>
          <div className="border-b-2 border-green-800 pb-3">
            @{profile.userName}
          </div>
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
