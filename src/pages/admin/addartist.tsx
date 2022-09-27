import { useState } from "react";
import { DebounceInput } from "react-debounce-input";
import Button from "../../components/input/Button";
import { trpc } from "../../utils/trpc";
import Image from "next/image";
import Input from "../../components/input/Input";

export default function AddArtistPage() {
  const [formInput, setFormInput] = useState("");
  const client = trpc.useContext();
  const { data, status } = trpc.useQuery(["admin.artist-search", formInput]);
  const { data: artistIds, refetch } = trpc.useQuery([
    "admin.added-artist-ids",
  ]);
  const addArtistMutation = trpc.useMutation(["admin.add-artist"]);

  const addArtist = async (id: string, name: string) => {
    client.setQueryData(
      ["admin.added-artist-ids"],
      (prev) => [...(prev || []), id] || []
    );

    await addArtistMutation.mutate(
      { id, name },
      {
        onSuccess: () => {
          console.log("Added artist");
          refetch();
        },
        onError: (err) => {
          console.log("Error adding artist", err);
        },
      }
    );
    return;
  };

  function Artist({
    artist,
    onAdd,
    artistIds,
  }: {
    artist: SpotifyApi.ArtistObjectFull;
    onAdd: (id: string, name: string) => void;
    artistIds: string[] | undefined;
  }) {
    const formatter = Intl.NumberFormat("en-US", {
      notation: "compact",
    });
    return (
      <div className="flex items-center justify-between gap-4 rounded-md bg-tan-100 p-3 shadow-sm">
        <div className="flex items-center gap-4">
          {artist?.images[2]?.url && (
            <Image
              alt="Artist image"
              width={48}
              height={48}
              className="rounded-full object-cover shadow-sm"
              src={artist.images[2].url}
            ></Image>
          )}
          <div>
            <div className="font-semibold">{artist.name}</div>
            <div className="text-sm opacity-50">
              {formatter.format(artist.followers.total)} Followers
            </div>
          </div>
        </div>
        {artistIds?.includes(artist.id) ? (
          <div>Added</div>
        ) : (
          <Button
            onClick={() => onAdd(artist.id, artist.name)}
            className="justify-self-end"
            disabled={addArtistMutation.status === "loading"}
          >
            Add
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className="grid place-items-center ">
      <DebounceInput
        element={Input}
        bg="tan-100"
        placeholder={"Search for an artist"}
        className="rounded-lg bg-tan-100 p-3"
        debounceTimeout={800}
        type="text"
        value={formInput}
        onChange={(e) => setFormInput(e.target.value)}
      />
      <div className="mt-4 flex max-w-lg flex-col items-stretch gap-4">
        {addArtistMutation.status === "loading" && (
          <div>Adding artist... Please wait</div>
        )}
        {status === "loading" && <div>Loading... </div>}
        {data &&
          data.artists.items.map((artist) => (
            <Artist
              artistIds={artistIds}
              onAdd={addArtist}
              artist={artist}
              key={artist.id}
            />
          ))}
      </div>
    </div>
  );
}
