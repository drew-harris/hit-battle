import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useNotifications } from "../../stores/notifications";

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
      setHasShownTip(true);
      localStorage.setItem("hasShownTip", "true");
      setTimeout(() => {
        sendNotification("Tip: You can preview songs by clicking album art");
      }, 5000);
    }
  }, [hasShownTip, sendNotification, router.pathname]);

  return <></>;
}
