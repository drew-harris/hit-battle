import Button from "../../../components/input/Button";
import { trpc } from "../../../utils/trpc";
import SimpleSong from "../../../components/admin/SimpleSong";
import { useEffect, useState } from "react";
import Pagination from "../../../components/input/Pagination";
import { useRouter } from "next/router";
import Input from "../../../components/input/Input";
import { DebounceInput } from "react-debounce-input";

export default function SongsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const client = trpc.useContext();
  const { data, error, refetch, status } = trpc.useQuery([
    "admin.all-songs",
    { page, query: searchQuery },
  ]);

  useEffect(() => {
    if (searchQuery === "") {
      client.prefetchQuery(["admin.all-songs", { page: page + 1, query: "" }]);
    }
  }, [page, client, searchQuery]);

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
      ["admin.all-songs", { page: page, query: searchQuery }],
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
      <div className="mb-4 flex flex-col justify-between md:flex-row">
        <div className="items flex flex-col gap-8 md:flex-row md:items-end">
          <h1 className="text-center text-3xl font-bold text-tan-500">
            All Songs
          </h1>
          <DebounceInput
            debounceTimeout={400}
            element={Input}
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            bg="tan-100"
            className="p-0 px-1"
            label="Search Songs"
          />
        </div>
        <Button
          className="mb-3 mt-4 hidden md:block"
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
            <SimpleSong
              onClickTitle={() => router.push("/admin/songs/" + song.id)}
              song={song}
              key={song.id}
            >
              <Button onClick={() => deleteSong(song.id)}>Delete</Button>
            </SimpleSong>
          ))}
      </div>
      {data?.length === 0 && <div className="text-center">No songs found</div>}
      {!searchQuery && (
        <Pagination hidePageLabel page={page} setPage={setPage} limit={100} />
      )}
    </div>
  );
}
