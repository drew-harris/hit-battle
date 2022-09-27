import { PulseLoader } from "react-spinners";
import Button from "../../components/input/Button";
import SimpleMatch from "../../components/matches/SimpleMatch";
import { trpc } from "../../utils/trpc";

export default function Matches() {
  const {
    data: matches,
    status,
    error,
    refetch,
  } = trpc.useQuery(["admin.all-matches"]);
  const nukeMatchesMutation = trpc.useMutation("admin.delete-matches");
  const nukeMatches = () => {
    nukeMatchesMutation.mutate(null, {
      onSettled: () => {
        refetch();
      },
    });
  };
  return (
    <div>
      <div className="align-center mb-3 flex justify-between">
        <div className="mb-3 text-2xl font-bold">Matches</div>
        <Button onClick={nukeMatches}>Delete All</Button>
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
        {matches &&
          matches.map((match) => (
            <SimpleMatch showDate={true} match={match} key={match.id} />
          ))}
      </div>
    </div>
  );
}
