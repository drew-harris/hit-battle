import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

interface LayoutProps {
  children: React.ReactNode;
}

interface Route {
  name: string;
  path: string;
  modOnly?: boolean;
  authOnly?: boolean;
}

export default function Layout({ children }: LayoutProps) {
  const session = useSession();
  if (!session.data && !(session.status === "loading")) {
    return <>{children}</>;
  }

  const routes: Route[] = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Today",
      path: "/today",
      authOnly: true,
    },
    {
      name: "Admin",
      path: "/admin",
      modOnly: true,
    },
    {
      name: "Account",
      path: "/account",
      modOnly: false,
    },
  ];

  // Only use a layout if there is a session
  return (
    <>
      <header className="flex justify-between px-4 pt-4 font-bold text-tan-500">
        <div>Stem Player Community Hit Battle</div>
        <a href="https://discord.gg/hqt4pZzyth">
          <FontAwesomeIcon size="lg" width={20} icon={faDiscord} />
        </a>
      </header>
      <nav className="flex gap-2 overflow-x-scroll p-4 ">
        {routes.map((route) => {
          if (route.modOnly && !session?.data?.user?.isMod) {
            return null;
          }
          return <RouteButton route={route} key={route.path}></RouteButton>;
        })}
      </nav>
      <div className="w-full px-8 pb-8">{children}</div>
    </>
  );
}

const RouteButton = ({ route }: { route: Route }) => {
  const router = useRouter();
  const active =
    (router.pathname.includes(route.path) && route.path !== "/") ||
    (route.path === "/" && router.pathname === route.path);
  const activeClass =
    "p-1 px-2 font-semibold text-white transition-transform rounded-lg bg-tan-400 sm:block hover:shadow-md ";

  const inactiveClass =
    "p-1 px-2 font-semibold text-tan-400 transition-transform rounded-lg sm:block ";
  const className = active ? activeClass : inactiveClass;
  return (
    <button
      className={className}
      onClick={() => {
        router.push(route.path);
      }}
    >
      {route.name}
    </button>
  );
};
