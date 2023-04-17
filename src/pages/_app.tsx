import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { type AppType } from "next/app"
import Head from "next/head"
import { Toaster } from "react-hot-toast"
import "~/styles/globals.css"
import { api } from "~/utils/api"

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Next Twitter Emoji</title>
        <meta
          name="description"
          content="Mini Twitter clone created by Jordan Winslow complete with network rate limiting, user auth, intelligent errors with schema validation, an intelligent caching layer and much more!"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <Toaster />
      <ClerkProvider
        {...pageProps}
        appearance={{
          baseTheme: dark,
        }}
      >
        <Component {...pageProps} />
      </ClerkProvider>
      {/* Normally we would not run this in production but enabling it since this is a
      demonstration application
      {process.env.NODE_ENV !== "production" && ( */}
      <ReactQueryDevtools initialIsOpen={false} />
      {/* )} */}
    </>
  )
}

export default api.withTRPC(MyApp)
