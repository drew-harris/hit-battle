// src/pages/_app.tsx
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { withTRPC } from "@trpc/next";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppType } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import superjson from "superjson";
import AudioPlayer from "../components/overlays/AudioPlayer";
import AudioTip from "../components/overlays/AudioTip";
import Notifications from "../components/overlays/Notifications";
import type { AppRouter } from "../server/router";
import { usePreviousVotes } from "../stores/alreadyVoted";
import "../styles/globals.css";
import { getBaseUrl, trpc } from "../utils/trpc";
import Layout from "../views/Layout";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { ...pageProps },
}) => {
  const { data: session } = trpc.useQuery(["my-session"], {
    ssr: true,
    refetchOnWindowFocus: false,
  });

  const load = usePreviousVotes((state) => state.load);

  useEffect(() => {
    load();
  }, []);

  return (
    <SessionProvider session={session}>
      <Head>
        <title>Stemplayer Hit Battle</title>
      </Head>
      <Layout initialSession={session}>
        <Component {...pageProps} />
        <AudioPlayer />
        <Notifications />
        <AudioTip />
      </Layout>
    </SessionProvider>
  );
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({ url }),
      ],
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },

      // To use SSR properly you need to forward the client's headers to the server
      headers: () => {
        if (ctx?.req) {
          const headers = ctx?.req?.headers;
          delete headers?.connection;
          return {
            ...headers,
            "x-ssr": "1",
          };
        }
        return {};
      },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: true,
})(MyApp);
