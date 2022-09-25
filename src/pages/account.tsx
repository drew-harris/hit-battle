import { signOut } from "next-auth/react";
import Button from "../components/input/Button";

export default function Account() {
  return (
    <Button
      onClick={() => {
        signOut({ callbackUrl: "/" });
      }}
      label="SIGN OUT"
    ></Button>
  );
}
