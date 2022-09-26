import { Prisma } from "@prisma/client";
import { useState } from "react";
import Button from "../../components/input/Button";
import { MatchWithSong } from "../../types/match";
import { inferMutationOutput, trpc, vanilla } from "../../utils/trpc";

export default function CreateMatchesPage() {
  const [matchups, setMatchups] = useState<
    inferMutationOutput<"admin.submit-matchups">
  >([]);

  const [matchDocs, setMatchDocs] = useState<
    inferMutationOutput<"admin.setup-matchups">
  >([]);

  const [uploadLoading, setUploadLoading] = useState(false);

  const [groupSize, setGroupSize] = useState<string>("2");
  const [matchNumber, setMatchNumber] = useState<string>("10");

  const createMatchesMutation = trpc.useMutation("admin.setup-matchups");
  const deleteMatchesMutation = trpc.useMutation("admin.delete-matches");

  const createMatches = () => {
    createMatchesMutation.mutate(
      {
        startDate: new Date(),
        groupSize: parseInt(groupSize) || 2,
        numMatchups: parseInt(matchNumber) || 10,
      },
      {
        onSuccess: (matches) => {
          console.log(matches);
          setMatchDocs((prev) => [...prev, ...matches]);
        },
        onError: (error) => {
          console.log(error);
        },
      }
    );
  };

  const submitMatches = async () => {
    // Split matches into groups of 5
    setUploadLoading(true);
    const groups = matchDocs.reduce((acc, match, index) => {
      const groupIndex = Math.floor(index / 5);
      if (!acc[groupIndex]) {
        acc[groupIndex] = [];
      }
      acc[groupIndex]?.push(match);
      return acc;
    }, [] as Prisma.MatchCreateManyInput[][]);

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      if (group) {
        const newMatchGroup = await vanilla.mutation(
          "admin.submit-matchups",
          group
        );
        setMatchups((prev) => [...prev, ...newMatchGroup]);
      }
    }

    setMatchDocs([]);
    setUploadLoading(false);
    console.log(groups);
  };

  const formClassName = "p-1 rounded bg-tan-100 w-48";
  return (
    <div>
      <h1 className="text-2xl font-bold">Create Matches</h1>
      <div className="flex gap-2">
        <div>
          <div>Group Size</div>
          <input
            className={formClassName}
            onChange={(e) => setGroupSize(e.target.value)}
            value={groupSize}
          ></input>
        </div>
        <div>
          <div>Number of Matches</div>
          <input
            className={formClassName}
            onChange={(e) => setMatchNumber(e.target.value)}
            value={matchNumber}
          ></input>
        </div>
      </div>

      <div className="my-4 flex gap-4">
        <Button
          onClick={createMatches}
          disabled={createMatchesMutation.isLoading}
          label="Generate Matches"
        />
        {matchDocs.length > 0 && (
          <>
            <Button onClick={() => setMatchDocs([])} label="Clear Matches" />
            <Button
              onClick={submitMatches}
              disabled={uploadLoading}
              label="Submit Matches"
            />
          </>
        )}
      </div>
      {uploadLoading && (
        <div className="my-4 bg-tan-100 p-4 text-center text-2xl font-bold">
          Uploading... Do Not Exit The Page
        </div>
      )}
      <div className="flex grid-cols-2 flex-col gap-4 ">
        <div className="rounded-sm bg-tan-100 p-4">
          <h2 className="mb-4 text-2xl font-bold">Match Docs</h2>
          <div>{matchDocs.length} Matches ready for upload</div>
        </div>
        <div className="rounded-sm bg-tan-100 p-4">
          <h2 className="mb-4 text-2xl font-bold">
            Created Matches ({matchups.length})
          </h2>
          <div className="grid-cols-2 gap-4 md:grid">
            {matchups &&
              matchups.map((match) => (
                <AdminMatchCard match={match} key={match.id} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminMatchCard({
  match,
  showDate = true,
}: {
  match: MatchWithSong;
  showDate?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-md bg-tan-200 p-2">
      {showDate && (
        <div className="text-center">{match.startDate.toLocaleString()}</div>
      )}
      <div
        className={`flex flex-col md:grid grid-cols-${match.songs.length} gap-2`}
      >
        {match.songs.map((song) => (
          <div
            key={song.id}
            className="flex items-center gap-8  rounded-md bg-tan-100 p-2 "
          >
            {song.albumArt && (
              <img src={song.albumArt} className="h-12 w-12 rounded-lg"></img>
            )}
            <div className="flex-shrink truncate">
              <div className=" truncate font-bold">{song.title}</div>
              <div>{song.artist}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
