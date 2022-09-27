import Link from "next/link";

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
      {props.value !== null && (
        <div
          className={`${
            props.size === "small" ? "text-xl" : "text-3xl"
          } font-bold`}
        >
          {props.value}
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
