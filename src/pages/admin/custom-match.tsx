import { Song } from "@prisma/client";
import { useState } from "react";
import { DebounceInput } from "react-debounce-input";
import Button from "../../components/input/Button";
import SimpleSong from "../../components/songs/SimpleSongs";
import { trpc } from "../../utils/trpc";

export default function CustomMatch() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [queryString, setQueryString] = useState("");
  const { data: searchResults } = trpc.useQuery([
    "songs.search-songs",
    queryString,
  ]);
  const submitMatchMutation = trpc.useMutation("admin.create-custom-match");
  const inputClassName = "p-2 rounded-md bg-tan-200 ";
  const [matchTitle, setMatchTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString());
  const [endDate, setEndDate] = useState("");

  const submitMatch = () => {
    console.log("submitting match");
    submitMatchMutation.mutate(
      {
        songs: songs,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        title: matchTitle || null,
      },
      {
        onSettled: () => {
          setSongs([]);
          setMatchTitle("");
          setStartDate(new Date().toISOString());
          setEndDate("");
        },
      }
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Custom Match</h1>
      <div className="rounded-xl bg-tan-100 p-4">
        <h1>Search</h1>
        <div className="">
          <DebounceInput
            className={inputClassName}
            debounceTimeout={300}
            value={queryString}
            onChange={(e) => setQueryString(e.target.value)}
            placeholder="Search for a song"
          />
          <div className="flex flex-wrap gap-4 pt-4">
            {searchResults?.map((song) => (
              <SimpleSong
                className="max-w-md bg-tan-200 shadow"
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
        <div className="mb-4">Match Settings</div>
        <div className="flex gap-4">
          <div>
            <div>Title</div>
            <input
              value={matchTitle}
              onChange={(e) => setMatchTitle(e.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <div>Start Date (UTC)</div>
            <input
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <div>End Date</div>
            <input
              placeholder="Leave blank for 24 hours after"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClassName}
            />
          </div>
        </div>
      </div>
      {songs.length > 1 && <Button onClick={submitMatch}>Create Match</Button>}
    </div>
  );
}
