import { Prisma } from "@prisma/client";
import { useState } from "react";
import Button from "../../components/input/Button";
import Input from "../../components/input/Input";
import SimpleBattle from "../../components/admin/SimpleBattle";
import { thisMorning } from "../../server/utils/dates";
import { inferMutationOutput, trpc, vanilla } from "../../utils/trpc";

export default function CreateBattlesPage() {
  const [battles, setBattles] = useState<
    inferMutationOutput<"admin.submit-battles">
  >([]);

  const [battleDocs, setBattleDocs] = useState<
    inferMutationOutput<"admin.setup-battles">
  >([]);

  const [startDate, setStartDate] = useState(thisMorning().toISOString());
  const [endDate, setEndDate] = useState("");

  const [uploadLoading, setUploadLoading] = useState(false);

  const [groupSize, setGroupSize] = useState<string>("2");
  const [battleNumber, setBattleNumber] = useState<string>("10");

  const createBattlesMutation = trpc.useMutation("admin.setup-battles");

  const createBattles = () => {
    createBattlesMutation.mutate(
      {
        startDate: new Date(startDate),
        groupSize: parseInt(groupSize) || 2,
        numBattles: parseInt(battleNumber) || 10,
      },
      {
        onSuccess: (battles) => {
          console.log(battles);
          setBattleDocs((prev) => [...prev, ...battles]);
        },
        onError: (error) => {
          console.log(error);
        },
      }
    );
  };

  const submitBattles = async () => {
    // Split battles into groups of 5
    setUploadLoading(true);
    const groups = battleDocs.reduce((acc, battle, index) => {
      const groupIndex = Math.floor(index / 5);
      if (!acc[groupIndex]) {
        acc[groupIndex] = [];
      }
      acc[groupIndex]?.push(battle);
      return acc;
    }, [] as Prisma.BattleCreateManyInput[][]);

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      if (group) {
        const newBattleGroup = await vanilla.mutation(
          "admin.submit-battles",
          group
        );
        setBattles((prev) => [...prev, ...newBattleGroup]);
      }
    }

    setBattleDocs([]);
    setUploadLoading(false);
    console.log(groups);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Create Battles</h1>
      <div className=" mt-4 flex flex-col flex-wrap  justify-center gap-2 sm:justify-start md:flex-row">
        <Input
          label="Group Size"
          bg="tan-100"
          onChange={(e) => setGroupSize(e.target.value)}
          value={groupSize}
        />
        <Input
          label="Number of Battles"
          bg="tan-100"
          onChange={(e) => setBattleNumber(e.target.value)}
          value={battleNumber}
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
          placeholder="Leave blank for 24h battle"
          onChange={(e) => setEndDate(e.target.value)}
          value={endDate}
        />
      </div>

      <div className="my-4 flex gap-4">
        <Button
          onClick={createBattles}
          disabled={createBattlesMutation.isLoading}
        >
          Generate battle
        </Button>
        {battleDocs.length > 0 && (
          <>
            <Button onClick={() => setBattleDocs([])}>Clear Battles</Button>
            <Button onClick={submitBattles} disabled={uploadLoading}>
              Submit Battles
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
          <h2 className="mb-4 text-2xl font-bold">Battle Docs</h2>
          <div>{battleDocs.length} Battles ready for upload</div>
        </div>
        <div className="rounded-sm p-4">
          <h2 className="mb-4 text-2xl font-bold">
            Created Battles ({battles.length})
          </h2>
          <div className="flex grid-cols-2 flex-col gap-4 md:grid">
            {battles &&
              battles.map((battle) => (
                <SimpleBattle showDate={true} battle={battle} key={battle.id} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
