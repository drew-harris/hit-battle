import { trpc } from "../../utils/trpc";

export default function UsersPage() {
  const { data, status } = trpc.useQuery(["admin.all-users"]);
  return (
    <div>
      {status === "loading" && <div>Loading...</div>}
      {data &&
        data.map((user) => (
          <div className="max-w-lg rounded-md bg-tan-100 p-2" key={user.id}>
            {user.name}
          </div>
        ))}
    </div>
  );
}
