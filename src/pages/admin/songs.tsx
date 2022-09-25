import { trpc } from "../../utils/trpc";

export default function SongsPage() {
  const { data, error } = trpc.useQuery(["admin.all-songs"]);
  return (
    <div>
      <h1 className="mb-3 text-2xl text-tan-500">All Songs</h1>
      {error && <div>{error.message}</div>}
      {data &&
        data.map((song) => (
          <div key={song.id}>{song.artist + " - " + song.title}</div>
        ))}
    </div>
  );
}
