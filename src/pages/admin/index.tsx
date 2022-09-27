import DashboardItem from "../../components/admin/DashboardItem";
import { trpc } from "../../utils/trpc";

export default function AdminHome() {
  const { data, status } = trpc.useQuery(["admin.dashboard-info"]);
  const nukeMutation = trpc.useMutation(["admin.nuke-all-songs"]);
  const nuke = () => {
    nukeMutation.mutate();
  };
  return (
    <div className="flex flex-wrap items-start justify-around gap-4 md:justify-start">
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
          <DashboardItem
            title="Current Matches"
            value={data.currentMatchCount}
            href="/admin/matches"
            linkLabel="View Matches"
          />
          <DashboardItem
            title="Total Matches"
            value={data.totalMatchCount}
            href="/admin/create-matches"
            linkLabel="Create Matches"
          />
          <DashboardItem
            linkLabel="Create Custom Match"
            href="/admin/custom-match"
            title="Custom Matches"
            value={data.customMatchCount}
          />
          <DashboardItem
            title="Songs With Previews"
            value={data.previewUrlCount}
          />
          <DashboardItem title="Total Votes" value={data.voteCount} />
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
