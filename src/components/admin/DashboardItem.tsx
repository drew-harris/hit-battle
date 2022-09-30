import Link from "next/link";
import { PulseLoader } from "react-spinners";

interface DashboardItemProps {
  title?: string;
  value?: string | number;
  children?: React.ReactNode;
  href?: string;
  linkLabel?: string;
  size?: "small" | "medium" | "large";
}
export default function DashboardItem(props: DashboardItemProps) {
  return (
    <div className="rounded-lg bg-tan-100  p-4 text-center shadow-md">
      {props.title && <div className="mb-2">{props.title}</div>}
      {props.value || props.value === 0 ? (
        <div
          className={`${
            props.size === "small" ? "text-xl" : "text-3xl"
          } font-bold`}
        >
          {props.value}
        </div>
      ) : (
        <div className="text-tan- mt-4">
          <PulseLoader size={6} color="rgb(84, 71, 56)" />
        </div>
      )}
      {props.children && <div>{props.children}</div>}
      {props.href && props.linkLabel && (
        <div className={props.title || props.children ? "mt-4" : ""}>
          <Link href={props.href}>
            <a className=" text-tan-500 underline">{props.linkLabel}</a>
          </Link>
        </div>
      )}
    </div>
  );
}
