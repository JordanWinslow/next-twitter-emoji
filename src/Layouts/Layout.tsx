import { type PropsWithChildren } from "react"

export function RootLayout({ children }: PropsWithChildren) {
  return (
    <main className="flex h-screen justify-center">
      <div className="flex h-full w-full flex-col  md:max-w-2xl">
        {children}
      </div>
    </main>
  )
}
