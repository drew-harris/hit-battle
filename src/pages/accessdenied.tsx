import Link from "next/link";
import Button from "../components/input/Button";

export default function AccessDenied() {
  return (
    <div className="grid h-[60vh] place-items-center items-center justify-center">
      <div className="flex flex-col gap-5 ">
        <div className="text-xl font-bold">ACCESS DENIED</div>
        <Button className="mx-auto">
          <Link href="/">Go Back</Link>
        </Button>
      </div>
    </div>
  );
}
