import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function useQuickSession(initialSession: Session | null = null) {
  const session = useSession();
  const [quickSession, setQuickSession] = useState<Session | null>(
    session.status != "loading" ? session.data : initialSession
  );

  useEffect(() => {
    if (session.status !== "loading") {
      setQuickSession(session.data);
    }
  }, [session, session.status]);

  return quickSession;
}
