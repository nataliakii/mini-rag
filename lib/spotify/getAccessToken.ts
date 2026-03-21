type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
};

type TokenCache = {
  token: string;
  expiresAtMs: number;
};

let tokenCache: TokenCache | null = null;

export async function getAccessToken(): Promise<SpotifyTokenResponse> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify auth failed: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is missing");
  }

  if (tokenCache && Date.now() < tokenCache.expiresAtMs) {
    return {
      access_token: tokenCache.token,
      expires_in: Math.max(1, Math.floor((tokenCache.expiresAtMs - Date.now()) / 1000)),
    };
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const body = new URLSearchParams({ grant_type: "client_credentials" });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Spotify auth failed: ${res.status} ${res.statusText}${text ? ` - ${text.slice(0, 200)}` : ""}`
    );
  }

  const data = (await res.json()) as SpotifyTokenResponse;
  if (!data.access_token || !data.expires_in) {
    throw new Error("Spotify auth failed: invalid token response");
  }

  // Keep small safety buffer before expiration.
  const expiresAtMs = Date.now() + Math.max(0, data.expires_in - 30) * 1000;
  tokenCache = { token: data.access_token, expiresAtMs };

  return data;
}
