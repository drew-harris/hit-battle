import Image from "next/image";
import { useRouter } from "next/router";
import SimpleMatch from "../../../components/matches/SimpleMatch";
import { trpc } from "../../../utils/trpc";

export default function SingleSongAdminPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: song } = trpc.useQuery(["songs.song", id as string]);
  if (!song) return <div>Loading...</div>;
  return (
    <>
      <div className="mx-auto flex max-w-max flex-col gap-4 rounded-lg bg-tan-100 p-4 sm:flex-row">
        <div className="relative h-48 w-48 max-w-md shrink-0">
          {song.albumArt && (
            <Image
              alt={song.title}
              src={song.albumArt}
              loading="lazy"
              placeholder="blur"
              blurDataURL={song.loaderAlbumArt || " "}
              layout="fill"
              className="rounded-md"
            />
          )}
        </div>
        <div>
          <div className="text-2xl font-bold">{song.title}</div>
          <div className="">{song.artist}</div>
          <div className="mb-2 ">{song.album}</div>
          <div className="">{song.matches.length} Battles</div>
          <div className="">{song.forVotes.length} Votes</div>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-start gap-10 ">
        {song.previewUrl && (
          <div>
            <div className="text-xl">Audio</div>
            <audio controls src={song.previewUrl}></audio>
          </div>
        )}

        <div>
          <div className="text-xl">Users</div>
          {song.users.map((user) => (
            <div key={user.id}>{user.name}</div>
          ))}
          {song.users.length === 0 && <div className="ml-2">No users</div>}
        </div>

        {song.matches && (
          <div className="max-w-lg">
            <div className="text-xl">Matches</div>
            <div className="flex flex-col gap-4">
              {song.matches.map((match) => (
                <SimpleMatch showDate match={match} key={match.id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
