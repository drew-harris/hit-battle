import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Button from "../components/input/Button";
import { trpc } from "../utils/trpc";
import HomeSignIn from "../views/HomeSignIn";

const Home: NextPage = () => {
  const tsession = trpc.useQuery(["user-info"]);
  const session = useSession();
  if (session.status === "loading") {
    return <div></div>;
  }
  if (session.status === "authenticated") {
    return (
      <div className="grid h-[80vh] place-items-center text-center">
        <div>
          <div className="mb-8 text-xl text-tan-500">Logged In</div>
          <Button onClick={() => signOut()}>Sign Out</Button>
        </div>
      </div>
    );
  } else {
    return <HomeSignIn></HomeSignIn>;
  }
};

export default Home;
