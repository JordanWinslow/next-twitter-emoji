import { type User } from "@clerk/nextjs/dist/api"

export const filterUserProperties = (user: User) => {
  return {
    id: user.id,
    userName: user.username || "randomuser " + user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    image: user.profileImageUrl,
  }
}
