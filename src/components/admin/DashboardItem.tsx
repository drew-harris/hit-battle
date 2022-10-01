import Link from "next/link";
import { PulseLoader } from "react-spinners";

interface DashboardItemProps {
  title?: string;
  value?: string | number;
  children?: React.ReactNode;
  href?: string;
  linkLabel?: string;
  size?: "small" | "medium" | "large";
  noValue?: boolean;
}
export default function DashboardItem({
  title,
  value,
  children,
  href,
  linkLabel,
  size = "medium",
}: DashboardItemProps) {
  return (
    <div className="rounded-lg bg-tan-100  p-4 text-center shadow-md">
      {title && <div className="mb-2">{title}</div>}
      {value || value === 0 ? (
        <div
          className={`${size === "small" ? "text-xl" : "text-3xl"} font-bold`}
        >
          {value}
        </div>
      ) : (
        <div className="text-tan- mt-4">
          <PulseLoader size={6} color="rgb(84, 71, 56)" />
        </div>
      )}
      {children && <div>{children}</div>}
      {href && linkLabel && (
        <div className={title || children ? "mt-4" : ""}>
          <Link href={href}>
            <a className=" text-tan-500 underline">{linkLabel}</a>
          </Link>
        </div>
      )}
    </div>
  );
}
