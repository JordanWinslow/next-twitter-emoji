import { type User } from "@clerk/nextjs/dist/api"

export const filterUserProperties = (user: User) => {
  return {
    id: user.id,
    userName: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    image: user.profileImageUrl,
    //externalUsername: user.externalAccounts.find((externalAccount) => externalAccount.provider === "oauth_github")?.username || null
  }
}
