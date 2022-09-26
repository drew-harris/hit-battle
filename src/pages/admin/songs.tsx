import Button from "../../components/input/Button";
import { trpc } from "../../utils/trpc";

export default function SongsPage() {
  const { data, error, refetch } = trpc.useQuery(["admin.all-songs"]);
  const nukeMutation = trpc.useMutation(["admin.nuke-all-songs"]);
  return (
    <div>
      <h1 className="text-2xl text-tan-500">All Songs</h1>
      <Button
        className="mb-3"
        label="Delete all songs"
        onClick={() =>
          nukeMutation.mutate(null, {
            onSettled: () => {
              refetch();
            },
          })
        }
        disabled={nukeMutation.isLoading}
      />
      {error && <div>{error.message}</div>}
      <div className=" grid grid-flow-row grid-cols-1 text-ellipsis break-words md:grid-cols-2 xl:grid-cols-3">
        {data &&
          data.map((song) => (
            <div className="" key={song.id}>
              {song.artist + " - " + song.title}
            </div>
          ))}
      </div>
    </div>
  );
}
