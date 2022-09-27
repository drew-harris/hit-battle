import Button from "../../components/input/Button";
import { trpc } from "../../utils/trpc";

export default function UsersPage() {
  const { data, status } = trpc.useQuery(["admin.all-users"]);
  const client = trpc.useContext();
  const banMutation = trpc.useMutation("admin.ban-user");

  const banUser = (id: string) => {
    client.setQueryData(
      ["admin.all-users"],
      (data) => data?.filter((user) => user.id !== id) || []
    );

    banMutation.mutate(id, {
      onSettled: () => {
        client.invalidateQueries(["admin.all-users"]);
      },
    });

    return;
  };

  return (
    <div className="flex flex-col gap-4">
      {status === "loading" && <div>Loading...</div>}
      {data &&
        data.map((user) => (
          <div
            className="flex max-w-lg items-center justify-between overflow-hidden truncate rounded-md bg-tan-100 p-2"
            key={user.id}
          >
            <div className="flex items-center gap-3 truncate">
              <div className="truncate">{user.name}</div>
              {user.isMod && <div className="mr-2 text-sm font-bold">Mod</div>}
            </div>
            <Button onClick={() => banUser(user.id)}>BAN</Button>
          </div>
        ))}
    </div>
  );
}
