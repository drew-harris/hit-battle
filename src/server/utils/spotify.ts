import { env } from "../../env/server.mjs";

export async function getNewToken(refreshToken: string) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${env.SPOTIFY_BASE64}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    console.log(response);
    throw new Error("Response not OK");
  }

  const data = (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
  };
  return data;
}
