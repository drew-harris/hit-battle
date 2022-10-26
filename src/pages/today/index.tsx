import SimpleBattle from "../../components/battles/Battle";
import PageHeader from "../../components/PageHeader";
import { trpc } from "../../utils/trpc";

export default function Today() {
  const { data: battles, status, error } = trpc.useQuery(["battles.today"]);
  return (
    <>
      <div className="flex items-baseline gap-4">
        <PageHeader text="Todays Battles"></PageHeader>
      </div>
      <div>
        {status === "loading" && <div>Loading...</div>}
        {status === "error" && <div>{error.message}</div>}
        <div className="grid grid-cols-3 gap-2">
          {battles?.map((battle) => (
            <SimpleBattle battle={battle} key={battle.id} />
          ))}
        </div>
      </div>
    </>
  );
}
