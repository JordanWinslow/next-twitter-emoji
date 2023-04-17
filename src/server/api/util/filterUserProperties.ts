import { type User } from "@clerk/nextjs/dist/api"

export const filterUserProperties = (user: User) => {
  return {
    id: user.id,
    // Naive approach for this demo app is to force a username so we don't
    // have to bother re-writing the routing.
    userName: user.username as string,
    firstName: user.firstName,
    lastName: user.lastName,
    image: user.profileImageUrl,
  }
}
