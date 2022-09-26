import { Prisma } from "@prisma/client";
import { z } from "zod";
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
              return {
                album: album.name,
                artist: track?.artists[0]?.name || input.name,
                albumArt: album?.images[0]?.url,
                albumId: album.id,
                artistId: input.id,
                title: track.name,
                previewUrl: track.preview_url,
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
    resolve: async ({ ctx }) => {
      try {
        const songs = await ctx.prisma.song.findMany({
          orderBy: [{ artist: "asc" }, { album: "asc" }],
        });
        console.log(songs);
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
      const matchCountPromise = ctx.prisma.match.count();
      const mostPopularSongPromise = ctx.prisma.song.findFirst({
        orderBy: [{ Votes: { _count: "asc" } }],
      });

      const [
        songsCount,
        artistCount,
        userCount,
        voteCount,
        matchCount,
        mostPopularSong,
      ] = await Promise.all([
        songsCountPromise,
        artistsCountPromise,
        userCountPromise,
        voteCountPromise,
        matchCountPromise,
        mostPopularSongPromise,
      ]);
      return {
        songsCount,
        artistCount: artistCount.length,
        userCount,
        voteCount,
        matchCount,
        mostPopularSong,
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
  });
