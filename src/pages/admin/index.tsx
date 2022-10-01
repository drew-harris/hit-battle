import DashboardItem from "../../components/admin/DashboardItem";
import { trpc } from "../../utils/trpc";

export default function AdminHome() {
  const { data } = trpc.useQuery(["admin.dashboard-info"], { ssr: true });
  return (
    <div className="flex flex-wrap items-start justify-around gap-4 md:justify-start">
      <DashboardItem
        title="Total Users"
        value={data?.userCount}
        href="/admin/users"
        linkLabel="View Users"
      />
      <DashboardItem
        title="Total Songs"
        value={data?.songsCount}
        href="/admin/songs"
        linkLabel="All Songs"
      />
      <DashboardItem
        title="Artists"
        value={data?.artistCount}
        href="/admin/addartist"
        linkLabel="Add Artist"
      />
      <DashboardItem
        title="Current Battles"
        value={data?.currentBattleCount}
        href="/admin/battles"
        linkLabel="View Battles"
      />
      <DashboardItem
        title="Total Battles"
        value={data?.totalBattleCount}
        href="/admin/create-battles"
        linkLabel="Create Battles"
      />
      <DashboardItem
        linkLabel="Create Custom Battle"
        href="/admin/custom-battle"
        title="Custom Battles"
        value={data?.customBattleCount}
      />
      <DashboardItem
        title="Songs With Previews"
        linkLabel="Songs without Previews"
        href="/admin/no-preview"
        value={data?.previewUrlCount}
      />
      <DashboardItem title="Total Votes" value={data?.voteCount} />
      <DashboardItem
        title="Most Popular Song"
        size="small"
        value={
          "" +
          data?.mostPopularSong?.title +
          " - " +
          data?.mostPopularSong?.artist
        }
      />
    </div>
  );
}
