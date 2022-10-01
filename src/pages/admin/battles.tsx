import { PulseLoader } from "react-spinners";
import Button from "../../components/input/Button";
import SimpleBattle from "../../components/battles/SimpleBattle";
import { trpc } from "../../utils/trpc";

export default function Battles() {
  const {
    data: battles,
    status,
    error,
    refetch,
  } = trpc.useQuery(["admin.all-battles"]);
  const nukeBattlesMutation = trpc.useMutation("admin.delete-battles");
  const nukeBattles = () => {
    nukeBattlesMutation.mutate(null, {
      onSettled: () => {
        refetch();
      },
    });
  };
  return (
    <div>
      <div className="align-center mb-3 flex justify-between">
        <div className="mb-3 text-2xl font-bold">Battles</div>
        <Button onClick={nukeBattles}>Delete All</Button>
      </div>
      <div className="flex flex-col gap-4">
        {status === "loading" && (
          <div className="grid place-items-center">
            <div>
              <PulseLoader />
            </div>
          </div>
        )}
        {status === "error" && <div>{error?.message}</div>}
        {battles &&
          battles.map((battle) => (
            <SimpleBattle showDate={true} battle={battle} key={battle.id} />
          ))}
      </div>
    </div>
  );
}
