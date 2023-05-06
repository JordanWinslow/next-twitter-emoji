# NextJS Twitter Emoji

This is a [Jordan Winslow Portfolio](https://JordanWinslow.dev) project designed to demonstrate emerging "serverless" technologies in Front End development which allow us to quickly iterate and scale full-stack production applications without having to manage a complex Back End like Express/NestJS.

_The app is basically a re-skinned clone of twitter that only allows Emojis._ [Click here to view it in production](https://next-twitter-emoji.vercel.app/)

## App Features

- The home page fetches a list of all posts created by any user, requiring auth via Github or Google in order to create posts.

- Clicking a post image, content or timestamp takes us to a page dedicated for that post

- Clicking the username or user avatar takes us to a profile page for that user

- After **passwordless sign-in**, users can type and submit posts with **Zod object schema validation** and **friendly error messages** appearing in the UI for specific issues such as text/numbers being entered instead of an emoji, no content being posted, too many characters being posted, and even <u>**rate-limiting!**</u>

## What are the key technologies demonstrated by this app?

- Server Side Rendering (SSR) + Client Hydration with **React Query** allows data fetching before the client ever receives the HTML _without losing access to the query context_ (in other words we have access to ALL the fetched data on the client, not just what was rendered)

- **tRPC** enables us to write Back End code on the Front End with automated end-to-end typesafety (No DTO type definitions, no duplicated types on BE/FE, automatic code completion)

- **Prisma** ORM is an experiment here. Not sure how I feel about this in production but the code is elegant and the DX is impressive.

- Rate limiting via **Upstash** _(expandable to support cron, queues and more)_

- **React Query Dev Tools** (enabled in production to demonstrate. Click bottom left icon to see it in action)

## How is this being deployed?

This application is currently being deployed through **Vercel** with a database hosted on **PlanetScale** and **CI** provided by **GitHub Actions**. Production logs are being collected through **Axiom**.

## How would I improve this if it were a real product?

- Implement User Table instead of relying on queries to Clerk Auth for basic user info
- Pagination/Infinite Querying with React Query & React Virtual
- Searching/Filtering Post Data
- Edit/Update/Delete Functionality
- Development & Feature branches
- Integration Tests
- Refactor pages/components to be a little more modular
- Keep an eye on NextJS new app directory features and consider using the powerful new routing/layout/"use client" automation introduced in Next 13 once it becomes production ready
