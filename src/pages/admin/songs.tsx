import Button from "../../components/input/Button";
import { trpc } from "../../utils/trpc";
import SimpleSong from "../../components/songs/SimpleSongs";
import { useEffect, useState } from "react";
import Pagination from "../../components/input/Pagination";

export default function SongsPage() {
  const [page, setPage] = useState(1);
  const client = trpc.useContext();
  const { data, error, refetch, status } = trpc.useQuery([
    "admin.all-songs",
    { page },
  ]);

  useEffect(() => {
    client.prefetchQuery(["admin.all-songs", { page: page + 1 }]);
  }, [page, client]);

  const nukeMutation = trpc.useMutation(["admin.nuke-all-songs"]);
  const deleteMutation = trpc.useMutation(["admin.delete-song"]);
  const nuke = () => {
    const answer = confirm("ARE YOU SURE YOU WANT TO DELETE ALL SONGS?");
    if (!answer) return;
    client.setQueryData(["admin.all-songs"], []);
    nukeMutation.mutate(null, {
      onSettled: () => {
        refetch();
      },
    });
  };

  const deleteSong = (id: string) => {
    client.setQueryData(
      ["admin.all-songs", { page: page }],
      (data) => data?.filter((song) => song.id !== id) || []
    );
    deleteMutation.mutate(id, {
      onError: () => {
        refetch();
      },
    });
  };

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-2xl text-tan-500">All Songs</h1>
        <Button
          className="mb-3"
          onClick={nuke}
          disabled={nukeMutation.isLoading}
        >
          Delete All Songs
        </Button>
      </div>
      {error && <div>{error.message}</div>}
      {status === "loading" && (
        <div className="mx-auto text-center">Loading...</div>
      )}
      <div className="grid grid-flow-row grid-cols-1 gap-1 text-ellipsis break-words md:grid-cols-2 xl:grid-cols-3">
        {data &&
          data.map((song) => (
            <SimpleSong song={song} key={song.id}>
              <Button onClick={() => deleteSong(song.id)}>Delete</Button>
            </SimpleSong>
          ))}
      </div>
      <Pagination page={page} setPage={setPage} limit={100} />
    </div>
  );
}
