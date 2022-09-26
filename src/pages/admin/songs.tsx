import Button from "../../components/input/Button";
import { trpc } from "../../utils/trpc";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export default function SongsPage() {
  const { data, error, refetch, status } = trpc.useQuery(["admin.all-songs"]);

  const addMutaiton = trpc.useMutation("admin.setup-matchups");
  const [parent] = useAutoAnimate<HTMLDivElement>();
  const client = trpc.useContext();
  const nukeMutation = trpc.useMutation(["admin.nuke-all-songs"]);
  const deleteMutation = trpc.useMutation(["admin.delete-song"]);
  const nuke = () => {
    client.setQueryData(["admin.all-songs"], []);
    nukeMutation.mutate(null, {
      onSettled: () => {
        refetch();
      },
    });
  };

  const deleteSong = (id: string) => {
    client.setQueryData(
      ["admin.all-songs"],
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
          label="Delete all songs"
          onClick={nuke}
          disabled={nukeMutation.isLoading}
        />
      </div>
      {error && <div>{error.message}</div>}
      {status === "loading" && (
        <div className="mx-auto text-center">Loading...</div>
      )}
      <div
        ref={parent}
        className="grid grid-flow-row grid-cols-1 text-ellipsis break-words md:grid-cols-2 xl:grid-cols-3"
      >
        {data &&
          data.map((song) => (
            <div
              onClick={() => deleteSong(song.id)}
              className="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap  p-1 hover:line-through"
              key={song.id}
            >
              {song.artist + " - " + song.title}
            </div>
          ))}
      </div>
    </div>
  );
}
