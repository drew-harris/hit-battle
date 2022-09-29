import { Prisma, Song } from "@prisma/client";
import shuffleArray from "shuffle-array";
import { v4 as uuidv4 } from "uuid";
import { z, ZodType } from "zod";
import { MatchWithSong } from "../../types/match";
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
          const newToken = await getNewToken();
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
          const newToken = await getNewToken();
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

        const albums = data.items;

        for (const album of albums) {
          if (!token) {
            return;
          }
          console.log("Album: ", album.id);
          const albumResponse = await fetch(
            `https://api.spotify.com/v1/albums/${album.id}/tracks?`,
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
              console.log("PREVIEW URL: ", track.preview_url);
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
      await ctx.prisma.song.deleteMany({});
      return null;
    },
  })

  .query("all-songs", {
    input: z.object({
      page: z.number().optional().default(1),
    }),
    resolve: async ({ ctx, input }) => {
      try {
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
      const currentMatchCountPromise = ctx.prisma.match.count({
        where: {
          endDate: {
            gte: rigntNow,
          },
          startDate: {
            lte: rigntNow,
          },
        },
      });

      const totalMatchCountPromise = ctx.prisma.match.count();

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

      const customMatchCountPromise = ctx.prisma.match.count({
        where: {
          isCustom: true,
        },
      });

      const [
        songsCount,
        artistCount,
        userCount,
        voteCount,
        currentMatchCount,
        totalMatchCount,
        mostPopularSong,
        previewUrlCount,
        customMatchCount,
      ] = await Promise.all([
        songsCountPromise,
        artistsCountPromise,
        userCountPromise,
        voteCountPromise,
        currentMatchCountPromise,
        totalMatchCountPromise,
        mostPopularSongPromise,
        previewUrlCountPromise,
        customMatchCountPromise,
      ]);
      return {
        songsCount,
        artistCount: artistCount.length,
        userCount,
        voteCount,
        currentMatchCount,
        totalMatchCount,
        mostPopularSong,
        previewUrlCount,
        customMatchCount,
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

  .mutation("setup-matchups", {
    input: z.object({
      numMatchups: z.number(),
      groupSize: z.number().min(2),
      startDate: z.date(),
      endDate: z.date().optional(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const songsCount = await ctx.prisma.song.count();
        const songs = await ctx.prisma.song.findMany({
          take: input.numMatchups * input.groupSize,
          skip: Math.floor(
            Math.random() * (songsCount - input.numMatchups * input.groupSize)
          ),
        });
        shuffleArray(songs);

        const matches: Prisma.MatchCreateInput[] = [];
        for (let i = 0; i < songs.length; i += input.groupSize) {
          const group = songs.slice(i, i + input.groupSize);
          const match: Prisma.MatchCreateInput = {
            songs: {
              connect: group.map((song) => ({ id: song.id })),
            },
            startDate: input.startDate,
            endDate:
              input.endDate ||
              new Date(input.startDate.getTime() + 24 * 60 * 60 * 1000),
            id: uuidv4(),
          };
          matches.push(match);
        }

        return matches;
      } catch (error) {
        throw new Error("could not create matchups");
      }
    },
  })

  .mutation("submit-matchups", {
    input: z.array(z.any()) as ZodType<Prisma.MatchCreateInput[]>,
    resolve: async ({ ctx, input }) => {
      try {
        const matches: MatchWithSong[] = [];
        for (const match of input) {
          const newMatch = await ctx.prisma.match.create({
            data: match,
            include: { songs: true },
          });

          matches.push(newMatch);
        }
        return matches;
      } catch (error) {
        throw new Error("could not submit matchups");
      }
    },
  })

  .query("all-matches", {
    resolve: async ({ ctx }) => {
      try {
        const matches = await ctx.prisma.match.findMany({
          orderBy: [{ startDate: "asc" }],
          include: {
            songs: true,
          },
        });
        return matches;
      } catch (error: unknown) {
        console.log(error);
        throw new Error("Error getting all matches");
      }
    },
  })

  .mutation("delete-matches", {
    resolve: async ({ ctx }) => {
      try {
        const matches = await ctx.prisma.match.deleteMany({});
        return matches;
      } catch (error: unknown) {
        console.log(error);
        throw new Error("Error deleting matches");
      }
    },
  })

  .mutation("create-custom-match", {
    input: z.object({
      songs: z.array(z.any()) as ZodType<Song[]>,
      startDate: z.date(),
      endDate: z.date().nullable(),
      title: z.string().nullable(),
    }),
    resolve: async ({ ctx, input }) => {
      try {
        const match = await ctx.prisma.match.create({
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
        return match;
      } catch (error) {
        throw new Error("Error creating custom match");
      }
    },
  });
