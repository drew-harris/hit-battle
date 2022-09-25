import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import Button from "../components/input/Button";

const HomeSignIn: NextPage = () => {
  return (
    <div className="grid h-[80vh] place-items-center overflow-hidden ">
      <div className="mx-auto flex flex-col items-center gap-4 text-center">
        <h1 className=" text-2xl font-bold text-tan-500">
          STEM PLAYER COMMUNITY HIT BATTLE
        </h1>
        <Button
          onClick={() => signIn("discord")}
          label="Sign In With Discord"
        />
      </div>
    </div>
  );
};

export default HomeSignIn;
