import { Prisma, Song } from "@prisma/client";
import shuffleArray from "shuffle-array";
import { v4 as uuidv4 } from "uuid";
import { z, ZodType } from "zod";
import { BattleWithSong } from "../../types/battle";
import { getNewToken } from "../utils/spotify";
import { createAdminRouter } from "./context";

export const adminRouter = createAdminRouter()
  .query("artist-search", {
    input: z.string(),
    resolve: async ({ ctx, input }) => {
      try {
        if (input === "") {
          return null;
        }
        console.log("\n searching for artist: ", input);
        let token = await ctx.prisma.spotifyCreds.findFirst({});
        if (!token || token.expires < new Date()) {
          const newToken = await getNewToken(token?.refreshToken || "failure");
          console.log("new token: ", newToken);
          token = await ctx.prisma.spotifyCreds.upsert({
            where: {
              id: "doc",
            },
            update: {
              token: newToken.access_token,
              expires: new Date(Date.now() + newToken.expires_in * 1000),
            },
            create: {
              token: newToken.access_token,
              expires: new Date(Date.now() + newToken.expires_in * 1000),
              id: "doc",
            },
          });
        }

        const response = await fetch(
          "https://api.spotify.com/v1/search?" +
            new URLSearchParams({
              q: input,
              type: "artist",
            }),
          {
            headers: {
              Authorization: `Bearer ${token.token}`,
            },
          }
        );

        if (!response.ok) {
          console.log(response.statusText);
          throw new Error("Response not OK");
        }

        const data = (await response.json()) as SpotifyApi.ArtistSearchResponse;
        return data;
      } catch (error) {
        console.log(error);
        throw new Error("Error searching for artists");
      }
      return null;
    },
  })
  .mutation("add-artist", {
    input: z.object({
      name: z.string(),
      id: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        let token = await ctx.prisma.spotifyCreds.findFirst({});
        if (!token || token.expires < new Date()) {
          const newToken = await getNewToken(token?.refreshToken || "failure");
          token = await ctx.prisma.spotifyCreds.upsert({
            where: {
              id: "doc",
            },
            update: {
              token: newToken.access_token,
              expires: new Date(Date.now() + newToken.expires_in * 1000),
            },
            create: {
              token: newToken.access_token,
              expires: new Date(Date.now() + newToken.expires_in * 1000),
              id: "doc",
            },
          });
        }
        console.error("Token: ", token);

        const response = await fetch(
          `https://api.spotify.com/v1/artists/${input.id}/albums?` +
            new URLSearchParams({
              include_groups: "album,single",
              limit: "50",
              market: "US",
            }),
          {
            headers: {
              Authorization: `Bearer ${token.token}`,
            },
          }
        );

        if (!response.ok) {
          console.log(await response.text());
          throw new Error("Response not OK");
        }

        const data =
          (await response.json()) as SpotifyApi.ArtistsAlbumsResponse;

        let albums = data.items;

        // Hopefully remove clean versions of albums
        // Still speeds things up
        albums = albums.reduce((acc, album) => {
          return acc.find((a) => a.name === album.name) ? acc : [...acc, album];
        }, [] as SpotifyApi.AlbumObjectSimplified[]);

        console.log(
          "Albums: ",
          albums.map((a) => `${a.id} - ${a.name} - ${a.external_urls.spotify}`)
        );

        for (const album of albums) {
          if (!token) {
            return;
          }
          console.log("Album: ", album.id);
          const albumResponse = await fetch(
            `https://api.spotify.com/v1/albums/${album.id}/tracks?` +
              new URLSearchParams({ market: "US" }),
            {
              headers: {
                Authorization: `Bearer ${token.token}`,
              },
            }
          );

          if (!response.ok) {
            console.log(response.statusText);
            throw new Error("Response not OK");
          }

          const albumData =
            (await albumResponse.json()) as SpotifyApi.AlbumTracksResponse;

          const tracks = albumData.items;
          const dbDocs = tracks
            .filter(
              (track) =>
                !track.name.includes("Edited") &&
                !track.name.includes("Album Version") &&
                !track.name.includes("Instrumental") &&
                track.artists[0]?.name === input.name
            )
            .map((track) => {
              return {
                album: album.name,
                artist: track?.artists[0]?.name || input.name,
                albumArt: album?.images[0]?.url,
                loaderAlbumArt: album?.images[album.images.length - 1]?.url,
                albumId: album.id,
                artistId: input.id,
                title: track.name,
                previewUrl: track.preview_url,
                trackNum: track.track_number,
                id: track.id,
                nameHash: input.name + "-" + track.name,
              };
            });

          await ctx.prisma.song.createMany({
            data: dbDocs,
            skipDuplicates: true,
          });
        }
        return null;
      } catch (error) {
        throw new Error("Error adding artist");
      }
    },
  })

  .query("added-artist-ids", {
    resolve: async ({ ctx }) => {
      const ids = await ctx.prisma.song.groupBy({
        by: ["artistId"],
      });

      return ids.map((id) => id.artistId);
    },
  })

  .mutation("nuke-all-songs", {
    resolve: async ({ ctx }) => {
      await ctx.prisma.vote.deleteMany({});
      await ctx.prisma.battle.deleteMany({});
      await ctx.prisma.song.deleteMany({});
      return null;
    },
  })

  .query("all-songs", {
    input: z.object({
      page: z.number().optional().default(1),
      query: z.string().optional(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        if (input.query) {
          const songs = await ctx.prisma.song.findMany({
            where: {
              title: {
                contains: input.query,
              },
            },
          });
          return songs;
        }
        const songs = await ctx.prisma.song.findMany({
          orderBy: [{ artist: "asc" }, { album: "asc" }, { trackNum: "asc" }],
          take: 24,
          skip: (input.page - 1) * 24,
        });
        return songs;
      } catch (error: unknown) {
        console.log(error);
        throw new Error("Error getting all songs");
      }
    },
  })

  .query("dashboard-info", {
    resolve: async ({ ctx }) => {
      const songsCountPromise = ctx.prisma.song.count();
      const artistsCountPromise = ctx.prisma.song.groupBy({
        by: ["artistId"],
      });
      const userCountPromise = ctx.prisma.user.count();
      const voteCountPromise = ctx.prisma.vote.count();
      const rigntNow = new Date();
      const currentBattleCountPromise = ctx.prisma.battle.count({
        where: {
          endDate: {
            gte: rigntNow,
          },
          startDate: {
            lte: rigntNow,
          },
        },
      });

      const totalBattleCountPromise = ctx.prisma.battle.count();

      const mostPopularSongPromise = ctx.prisma.song.findFirst({
        orderBy: [{ votes: { _count: "asc" } }],
      });

      const previewUrlCountPromise = ctx.prisma.song.count({
        where: {
          previewUrl: {
            not: null,
          },
        },
      });

      const customBattleCountPromise = ctx.prisma.battle.count({
        where: {
          isCustom: true,
        },
      });

      const [
        songsCount,
        artistCount,
        userCount,
        voteCount,
        currentBattleCount,
        totalBattleCount,
        mostPopularSong,
        previewUrlCount,
        customBattleCount,
      ] = await Promise.all([
        songsCountPromise,
        artistsCountPromise,
        userCountPromise,
        voteCountPromise,
        currentBattleCountPromise,
        totalBattleCountPromise,
        mostPopularSongPromise,
        previewUrlCountPromise,
        customBattleCountPromise,
      ]);
      return {
        songsCount,
        artistCount: artistCount.length,
        userCount,
        voteCount,
        currentBattleCount,
        totalBattleCount,
        mostPopularSong,
        previewUrlCount,
        customBattleCount,
      };
    },
  })

  .query("all-users", {
    resolve: async ({ ctx }) => {
      try {
        const users = await ctx.prisma.user.findMany({
          orderBy: [{ name: "asc" }],
        });
        return users;
      } catch (error: unknown) {
        console.log(error);
        throw new Error("Error getting all users");
      }
    },
  })

  .mutation("ban-user", {
    input: z.string(),
    resolve: async ({ ctx, input }) => {
      const user = await ctx.prisma.user.delete({
        where: { id: input },
      });
      return user;
    },
  })

  .mutation("delete-song", {
    input: z.string(),
    resolve: async ({ ctx, input }) => {
      try {
        const song = await ctx.prisma.song.delete({
          where: { id: input },
        });
        return song;
      } catch (error) {
        throw new Error("Error deleting song");
      }
    },
  })

  .mutation("setup-battles", {
    input: z.object({
      numBattles: z.number(),
      groupSize: z.number().min(2),
      startDate: z.date(),
      endDate: z.date().optional(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const songsCount = await ctx.prisma.song.count();
        const songs = await ctx.prisma.song.findMany({
          take: input.numBattles * input.groupSize,
          skip: Math.floor(
            Math.random() * (songsCount - input.numBattles * input.groupSize)
          ),
        });
        shuffleArray(songs);

        const battles: Prisma.BattleCreateInput[] = [];
        for (let i = 0; i < songs.length; i += input.groupSize) {
          const group = songs.slice(i, i + input.groupSize);
          const battle: Prisma.BattleCreateInput = {
            songs: {
              connect: group.map((song) => ({ id: song.id })),
            },
            voteCounts: Array(group.length).fill(0),
            startDate: input.startDate,
            endDate:
              input.endDate ||
              new Date(input.startDate.getTime() + 24 * 60 * 60 * 1000),
            id: uuidv4(),
          };
          battles.push(battle);
        }

        return battles;
      } catch (error) {
        throw new Error("could not create battles");
      }
    },
  })

  .mutation("submit-battles", {
    input: z.array(z.any()) as ZodType<Prisma.BattleCreateInput[]>,
    resolve: async ({ ctx, input }) => {
      try {
        const battles: BattleWithSong[] = [];
        for (const battle of input) {
          const newBattle = await ctx.prisma.battle.create({
            data: battle,
            include: { songs: true },
          });

          battles.push(newBattle);
        }
        return battles;
      } catch (error) {
        throw new Error("could not submit battles");
      }
    },
  })

  .query("all-battles", {
    resolve: async ({ ctx }) => {
      try {
        const battles = await ctx.prisma.battle.findMany({
          orderBy: [{ startDate: "asc" }, { id: "asc" }],
          include: {
            songs: true,
          },
        });
        return battles;
      } catch (error: unknown) {
        console.log(error);
        throw new Error("Error getting all battles");
      }
    },
  })

  .mutation("delete-battles", {
    resolve: async ({ ctx }) => {
      try {
        const votes = await ctx.prisma.vote.deleteMany({});
        const battles = await ctx.prisma.battle.deleteMany({});
        return battles;
      } catch (error: unknown) {
        console.log(error);
        throw new Error("Error deleting battles");
      }
    },
  })

  .mutation("create-custom-battle", {
    input: z.object({
      songs: z.array(z.any()) as ZodType<Song[]>,
      startDate: z.date(),
      endDate: z.date().nullable(),
      title: z.string().nullable(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const battle = await ctx.prisma.battle.create({
          data: {
            songs: {
              connect: input.songs.map((song) => ({ id: song.id })),
            },
            startDate: input.startDate,
            endDate:
              input.endDate ||
              new Date(input.startDate.getTime() + 24 * 60 * 60 * 1000),
            title: input.title,
            isCustom: true,
          },
        });
        return battle;
      } catch (error) {
        throw new Error("Error creating custom battles");
      }
    },
  })

  .mutation("add-vote", {
    input: z.object({
      battleId: z.string(),
      forSongId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      console.log("ADMIN ADD VOTE", input);
      try {
        const addedPromise = ctx.prisma.vote.create({
          data: {
            battle: {
              connect: { id: input.battleId },
            },
            for: {
              connect: { id: input.forSongId },
            },
            user: {
              connect: { id: ctx.session.user.id },
            },
          },
        });

        const latestCountsPromise = ctx.prisma.battle.findFirst({
          where: {
            id: input.battleId,
          },
          select: {
            voteCounts: true,
            songs: {
              select: {
                id: true,
              },
            },
          },
        });

        const [addedVote, latestCounts] = await Promise.all([
          addedPromise,
          latestCountsPromise,
        ]);

        console.log("ADMIN ADD VOTE", addedVote, latestCounts);

        if (!latestCounts || !latestCounts.songs) {
          throw new Error("Error adding vote");
        }

        const newCounts = latestCounts.voteCounts.map((count, i) => {
          if (latestCounts?.songs[i]?.id === input.forSongId) {
            return count + 1;
          }
          return count;
        });

        console.log("NEW COUNTS", newCounts);

        const updated = await ctx.prisma.battle.update({
          where: { id: input.battleId },
          data: {
            voteCounts: {
              set: newCounts,
            },
          },
          include: {
            songs: true,
          },
        });

        return { addedVote, battle: updated };
      } catch (error) {
        console.log(error);
        throw new Error("Error adding vote");
      }
    },
  })

  .query("no-preview", {
    resolve: async ({ ctx }) => {
      try {
        const songs = await ctx.prisma.song.findMany({
          where: {
            previewUrl: null,
          },
        });
        return songs;
      } catch (error) {
        throw new Error("Error getting no-preview");
      }
    },
  });
