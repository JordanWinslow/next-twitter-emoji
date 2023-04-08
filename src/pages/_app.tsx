import { ClerkProvider } from "@clerk/nextjs"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { type AppType } from "next/app"
import { Toaster } from "react-hot-toast"
import "~/styles/globals.css"
import { api } from "~/utils/api"

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Toaster />
      <ClerkProvider {...pageProps}>
        <Component {...pageProps} />
      </ClerkProvider>
      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  )
}

export default api.withTRPC(MyApp)
