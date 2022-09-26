// src/utils/trpc.ts
import type { AppRouter } from "../server/router";
import { createReactQueryHooks, createTRPCClient } from "@trpc/react";
import type { inferProcedureOutput, inferProcedureInput } from "@trpc/server";
import superjson from "superjson";
import { getBaseUrl } from "../pages/_app";

export const trpc = createReactQueryHooks<AppRouter>();

export const vanilla = createTRPCClient<AppRouter>({
  url: `${getBaseUrl()}/api/trpc`,
  transformer: superjson,
});

/**
 * These are helper types to infer the input and output of query resolvers
 * @example type HelloOutput = inferQueryOutput<'hello'>
 */
export type inferQueryOutput<
  TRouteKey extends keyof AppRouter["_def"]["queries"]
> = inferProcedureOutput<AppRouter["_def"]["queries"][TRouteKey]>;

export type inferQueryInput<
  TRouteKey extends keyof AppRouter["_def"]["queries"]
> = inferProcedureInput<AppRouter["_def"]["queries"][TRouteKey]>;

export type inferMutationOutput<
  TRouteKey extends keyof AppRouter["_def"]["mutations"]
> = inferProcedureOutput<AppRouter["_def"]["mutations"][TRouteKey]>;

export type inferMutationInput<
  TRouteKey extends keyof AppRouter["_def"]["mutations"]
> = inferProcedureInput<AppRouter["_def"]["mutations"][TRouteKey]>;
