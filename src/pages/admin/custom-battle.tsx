import { Song } from "@prisma/client";
import { useState } from "react";
import { DebounceInput } from "react-debounce-input";
import Button from "../../components/input/Button";
import Input from "../../components/input/Input";
import SimpleSong from "../../components/admin/SimpleSong";
import { thisMorning } from "../../server/utils/dates";
import { trpc } from "../../utils/trpc";

export default function CustomBattle() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [queryString, setQueryString] = useState("");
  const { data: searchResults } = trpc.useQuery([
    "songs.search-songs",
    queryString,
  ]);
  const submitBattleMutation = trpc.useMutation("admin.create-custom-battle");
  const inputClassName = "p-2 rounded-md bg-tan-200 ";
  const [battleTitle, setBattleTitle] = useState("");
  const [startDate, setStartDate] = useState(thisMorning().toISOString());
  const [endDate, setEndDate] = useState("");

  const submitBattle = () => {
    console.log("submitting battle");
    submitBattleMutation.mutate(
      {
        songs: songs,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        title: battleTitle || null,
      },
      {
        onSettled: () => {
          setSongs([]);
          setBattleTitle("");
          setStartDate(new Date().toISOString());
          setEndDate("");
        },
      }
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Custom Battle</h1>
      <div className="rounded-xl bg-tan-100 p-4">
        <div className="">
          <DebounceInput
            element={Input}
            debounceTimeout={300}
            value={queryString}
            onChange={(e) => setQueryString(e.target.value)}
            placeholder="Search for a song"
          />
          <div className="flex flex-wrap gap-x-4">
            {searchResults?.map((song) => (
              <SimpleSong
                className="mt-4 max-w-md bg-tan-200 shadow"
                song={song}
                key={song.id}
              >
                <Button
                  onClick={() => {
                    setSongs((prev) => [...prev, song]);
                  }}
                  disabled={songs.some((s) => s.id === song.id)}
                >
                  Add
                </Button>
              </SimpleSong>
            ))}
          </div>
        </div>
      </div>

      <div className="my-4 rounded-xl bg-tan-100 p-4">
        <h1>Selected Songs</h1>
        <div className="my-4 flex flex-wrap gap-2">
          {songs.map((song) => (
            <SimpleSong
              className="max-w-sm bg-tan-200 shadow"
              song={song}
              key={song.id}
            >
              <Button
                onClick={() => {
                  setSongs((prev) => prev.filter((s) => s.id !== song.id));
                }}
              >
                Remove
              </Button>
            </SimpleSong>
          ))}
        </div>
      </div>
      <div className="my-4 rounded-xl bg-tan-100 p-4">
        <div className="mb-4">Battle Settings</div>
        <div className="flex flex-col gap-4 md:flex-row">
          <Input
            label="Battle Title"
            value={battleTitle}
            onChange={(e) => setBattleTitle(e.target.value)}
            className={inputClassName}
          />
          <Input
            label="Start Date (UTC)"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClassName}
          />
          <Input
            label="End Date (UTC)"
            placeholder="Leave blank for 24 hours after"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>
      {songs.length > 1 && (
        <Button onClick={submitBattle}>Create Battle</Button>
      )}
    </div>
  );
}
