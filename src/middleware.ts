import withAuth from "next-auth/middleware";

export { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    console.log(req.nextauth.token);
  },
  {
    callbacks: {
      authorized: (params) => params.token?.isMod === true,
    },
    pages: {
      signIn: "/accessdenied",
    },
  }
);

export const config = { matcher: ["/admin/:path*"] };
