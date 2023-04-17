import { Dialog, Transition } from "@headlessui/react"
import Link from "next/link"
import { Fragment, useRef, useState, type PropsWithChildren } from "react"

function InfoButtonModal() {
  const [open, setOpen] = useState(false)

  const cancelButtonRef = useRef(null)

  return (
    <>
      <div
        className="absolute right-0 top-0 z-20 cursor-pointer rounded-lg rounded-t-none rounded-br-none bg-green-900 px-3 text-xl text-white"
        onClick={() => setOpen((open) => !open)}
      >
        About
      </div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          About This App
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="mb-2 text-sm text-gray-500">
                            The home page displays a list of all posts from all
                            users, regardless of if you are logged in.
                          </p>
                          <p className="mb-2 text-sm text-gray-500">
                            To create a post, you must sign in with Google or
                            GitHub. Try out typing things other than emojis, or
                            posting more than 4 times in less than a minute to
                            see the post validation.
                          </p>
                          <p className="mb-2 text-sm text-gray-500">
                            Click a user&apos;s name or avatar to see a page
                            with all their posts.
                          </p>
                          <p className="mb-2 text-sm text-gray-500">
                            Click a post or timestamp to see a page with just
                            that post.
                          </p>
                          <p className="mb-2 text-sm text-gray-500">
                            Click the bottom left flower icon to see all the API
                            data as it is being fetched and cached.
                          </p>
                          <p className="mb-2 text-sm text-gray-500">
                            This app is responsive. Try resizing the window.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
export function RootLayout({ children }: PropsWithChildren) {
  return (
    <main className="relative flex h-screen justify-center">
      <Link
        href="/"
        className="absolute left-0 top-0 z-20 cursor-pointer cursor-pointer rounded-lg rounded-t-none rounded-bl-none bg-green-900 px-3 text-xl text-white"
      >
        Home
      </Link>
      <InfoButtonModal />
      <div className="flex h-full w-full flex-col  md:max-w-2xl">
        {children}
      </div>
    </main>
  )
}
