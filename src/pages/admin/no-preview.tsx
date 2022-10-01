import SimpleSong from "../../components/admin/SimpleSong";
import { trpc } from "../../utils/trpc";

export default function NoPreviewPage() {
  const { data: songs, status } = trpc.useQuery(["admin.no-preview"]);
  return (
    <div>
      {songs && songs.map((song) => <SimpleSong song={song} key={song.id} />)}
    </div>
  );
}
