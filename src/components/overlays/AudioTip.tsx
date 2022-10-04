import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useNotifications } from "../../stores/notifications";
import Button from "../input/Button";

function getHasShownTip(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem("hasShownTip") === "true";
}

export default function AudioTip() {
  const [hasShownTip, setHasShownTip] = useState(getHasShownTip());
  const sendNotification = useNotifications((state) => state.sendNotification);
  const router = useRouter();

  useEffect(() => {
    if (
      !hasShownTip &&
      router.pathname === "/today" &&
      !(typeof window === "undefined")
    ) {
      console.log("HERE", window);
      setHasShownTip(true);
      localStorage.setItem("hasShownTip", "true");
      setTimeout(() => {
        console.log("ALSO HERE");
        sendNotification("Tip: You can preview songs by clicking album art");
      }, 1000);
    }
  }, [hasShownTip, sendNotification, router.pathname]);

  function setTipShown() {
    setHasShownTip(true);
    localStorage.setItem("hasShownTip", "false");
  }

  return (
    <>
      <Button onClick={setTipShown}>RESET</Button>
      <div>{router.pathname}</div>
    </>
  );
}
