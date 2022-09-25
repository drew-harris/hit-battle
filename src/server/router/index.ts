// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { protectedExampleRouter } from "./protected-example-router";
import { adminRouter } from "./admin";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("auth.", protectedExampleRouter)
  .merge("admin.", adminRouter)
  .query("user-info", {
    resolve: ({ ctx }) => {
      console.log(ctx.session);
      return ctx.session?.user;
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;
