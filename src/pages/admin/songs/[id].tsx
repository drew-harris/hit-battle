import Image from "next/image";
import { useRouter } from "next/router";
import Button from "../../../components/input/Button";
import SimpleBattle from "../../../components/admin/SimpleBattle";
import shallow from "zustand/shallow";
import { useAudioStore } from "../../../stores/audio";
import { trpc } from "../../../utils/trpc";

export default function SingleSongAdminPage() {
  const router = useRouter();
  const { id } = router.query;
  const { start, togglePause } = useAudioStore(
    (state) => ({
      start: state.start,
      togglePause: state.togglePause,
    }),
    shallow
  );
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
          <div className="">{song.battles.length} Battles</div>
          <div className="">{song.votes.length} Votes</div>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-start gap-10 ">
        {song.previewUrl && (
          <div>
            <div className="text-xl">Audio</div>
            <Button
              onClick={() => {
                start(song);
              }}
            >
              Start
            </Button>
            <Button
              onClick={() => {
                togglePause();
              }}
            >
              Pause
            </Button>
          </div>
        )}

        <div>
          <div className="text-xl">Users</div>
          {song.users.map((user) => (
            <div key={user.id}>{user.name}</div>
          ))}
          {song.users.length === 0 && <div className="ml-2">No users</div>}
        </div>

        {song.battles && (
          <div className="max-w-lg">
            <div className="text-xl">Battles</div>
            <div className="flex flex-col gap-4">
              {song.battles.map((battle) => (
                <SimpleBattle showDate battle={battle} key={battle.id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
