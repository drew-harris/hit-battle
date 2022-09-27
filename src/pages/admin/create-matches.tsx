import { Prisma } from "@prisma/client";
import { useState } from "react";
import Button from "../../components/input/Button";
import Input from "../../components/input/Input";
import SimpleMatch from "../../components/matches/SimpleMatch";
import { thisMorning } from "../../server/utils/dates";
import { inferMutationOutput, trpc, vanilla } from "../../utils/trpc";

export default function CreateMatchesPage() {
  const [matchups, setMatchups] = useState<
    inferMutationOutput<"admin.submit-matchups">
  >([]);

  const [matchDocs, setMatchDocs] = useState<
    inferMutationOutput<"admin.setup-matchups">
  >([]);

  const [startDate, setStartDate] = useState(thisMorning().toISOString());
  const [endDate, setEndDate] = useState("");

  const [uploadLoading, setUploadLoading] = useState(false);

  const [groupSize, setGroupSize] = useState<string>("2");
  const [matchNumber, setMatchNumber] = useState<string>("10");

  const createMatchesMutation = trpc.useMutation("admin.setup-matchups");

  const createMatches = () => {
    createMatchesMutation.mutate(
      {
        startDate: new Date(startDate),
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

  return (
    <div>
      <h1 className="text-2xl font-bold">Create Matches</h1>
      <div className=" mt-4 flex  flex-wrap justify-center gap-2 sm:justify-start">
        <Input
          label="Group Size"
          bg="tan-100"
          onChange={(e) => setGroupSize(e.target.value)}
          value={groupSize}
        />
        <Input
          label="Number of Matches"
          bg="tan-100"
          onChange={(e) => setMatchNumber(e.target.value)}
          value={matchNumber}
        />
        <Input
          label="Start Date"
          bg="tan-100"
          onChange={(e) => setStartDate(e.target.value)}
          value={startDate}
        />
        <Input
          label="End Date"
          bg="tan-100"
          placeholder="Leave blank for 24h match"
          onChange={(e) => setEndDate(e.target.value)}
          value={endDate}
        />
      </div>

      <div className="my-4 flex gap-4">
        <Button
          onClick={createMatches}
          disabled={createMatchesMutation.isLoading}
        >
          Generate matches
        </Button>
        {matchDocs.length > 0 && (
          <>
            <Button onClick={() => setMatchDocs([])}>Clear Matches</Button>
            <Button onClick={submitMatches} disabled={uploadLoading}>
              Submit Matches
            </Button>
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
        <div className="rounded-sm p-4">
          <h2 className="mb-4 text-2xl font-bold">
            Created Matches ({matchups.length})
          </h2>
          <div className="flex grid-cols-2 flex-col gap-4 md:grid">
            {matchups &&
              matchups.map((match) => (
                <SimpleMatch showDate={true} match={match} key={match.id} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
