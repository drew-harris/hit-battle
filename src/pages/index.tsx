import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Button from "../components/input/Button";
import HomeSignIn from "../views/HomeSignIn";

const Home: NextPage = () => {
  const session = useSession();
  if (session.status === "loading") {
    return <div></div>;
  }
  if (session.status === "authenticated") {
    return (
      <div className="grid h-[80vh] place-items-center text-center">
        <div>
          <div className="mb-8 text-xl text-tan-500">Logged In</div>
          <Button onClick={() => signOut()} label="Sign Out" />
        </div>
      </div>
    );
  } else {
    return <HomeSignIn></HomeSignIn>;
  }
};

export default Home;
