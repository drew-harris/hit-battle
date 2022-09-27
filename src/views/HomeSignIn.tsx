import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import Button from "../components/input/Button";

const HomeSignIn: NextPage = () => {
  return (
    <div className="grid h-[80vh] place-items-center overflow-hidden ">
      <div className="mx-auto items-center  rounded-lg bg-tan-100 p-8 text-center shadow-sm">
        <h1 className=" text-2xl font-bold text-tan-500">
          STEM PLAYER COMMUNITY HIT BATTLE
        </h1>
        <h3 className="mb-8 mt-0  text-tan-400">
          Sponsored by&nbsp;
          <span className="underline">
            <a href="https://www.stemify2.net">Stemify</a>
          </span>
        </h3>
        <Button onClick={() => signIn("discord")}>Sign In With Discord</Button>
      </div>
    </div>
  );
};

export default HomeSignIn;
