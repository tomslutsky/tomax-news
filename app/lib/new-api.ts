import { z } from "zod";

const api_key = process.env.NEWS_API_KEY;

const base_url = "https://newsapi.org/v2";

const articleSchema = z.object({
  source: z.object({
    id: z.string().nullish(),
    name: z.string(),
  }),
  author: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  urlToImage: z.string().nullish(),
  publishedAt: z.string(),
  content: z.string().nullable(),
});

export type Article = z.infer<typeof articleSchema>;
const responseSchema = z.object({
  status: z.string(),
  totalResults: z.number(),
  articles: z.array(articleSchema),
});

function _fetch(url: string) {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${api_key}`,
      accept: "application/json",
    },
  });
}

export async function getTopHeadlines(args: {
  language: string;
  q?: string;
  page?: number;
  category?: string;
}): Promise<{
  articles: Article[];
  totalResults: number;
  status: string;
}> {
  const sp = new URLSearchParams();
  for (const key in args) {
    // @ts-expect-error
    if (args[key]) {
      // @ts-expect-error
      sp.set(key, args[key]);
    }
  }
  const url = new URL(`${base_url}/top-headlines`);
  url.search = sp.toString();

  try {
    const response = await _fetch(url.toString());
    if (response.ok) {
      let data = await response.json();
      return responseSchema.parse(data);
    }
  } catch (e) {
    console.log(e);
  }

  return {
    articles: [],
    totalResults: 0,
    status: "error",
  };
}

export async function getEverything(args: { q?: string }) {
  const sp = new URLSearchParams({ q: "israel" });
  const url = new URL(`${base_url}/everything`);
  url.search = sp.toString();
  const response = await fetch(url.toString());
  if (!response.ok) {
    console.log(response);

    throw new Error("Error");
  }
  let data = await response.json();
  return responseSchema.parse(data);
}
