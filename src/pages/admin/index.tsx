import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Button from "../../components/input/Button";
import { trpc } from "../../utils/trpc";

export default function AdminHome() {
  const nukeMutation = trpc.useMutation(["admin.nuke-all-songs"]);
  const nuke = () => {
    nukeMutation.mutate();
  };
  return (
    <div className="flex flex-col items-start gap-4">
      <Link href="/admin/addartist">
        <div className="flex max-w-sm cursor-pointer items-center gap-4 rounded-lg bg-tan-100 p-3">
          <FontAwesomeIcon icon={faUserPlus} />
          <a className="">Add Artist</a>
        </div>
      </Link>
      <Link href="/admin/songs">
        <div className="flex max-w-sm cursor-pointer items-center gap-4 rounded-lg bg-tan-100 p-3">
          <a>Songs</a>
        </div>
      </Link>
      <Button onClick={nuke} className="bg-red-800" label="NUKE ALL SONGS" />
    </div>
  );
}
