import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import DashboardItem from "../../components/admin/DashboardItem";
import Button from "../../components/input/Button";
import { trpc } from "../../utils/trpc";

export default function AdminHome() {
  const { data, status } = trpc.useQuery(["admin.dashboard-info"]);
  const nukeMutation = trpc.useMutation(["admin.nuke-all-songs"]);
  const nuke = () => {
    nukeMutation.mutate();
  };
  return (
    <div className="flex flex-wrap items-start justify-around gap-4 md:justify-start">
      {status === "loading" && <div>Loading...</div>}
      {data && (
        <>
          <DashboardItem
            title="Total Users"
            value={data.userCount}
            href="/admin/users"
            linkLabel="View Users"
          />
          <DashboardItem
            title="Total Songs"
            value={data.songsCount}
            href="/admin/songs"
            linkLabel="All Songs"
          />
          <DashboardItem
            title="Artists"
            value={data.artistCount}
            href="/admin/addartist"
            linkLabel="Add Artist"
          />
          <DashboardItem title="Total Votes" value={data.voteCount} />
          <DashboardItem title="Total Matches" value={data.matchCount} />
          <DashboardItem
            title="Most Popular Song"
            size="small"
            value={
              "" +
              data.mostPopularSong?.title +
              " - " +
              data.mostPopularSong?.artist
            }
          />
        </>
      )}
    </div>
  );
}
