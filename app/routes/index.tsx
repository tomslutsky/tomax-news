import { json, type LoaderArgs } from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useRef, useState, useCallback } from "react";
import { z } from "zod";
import { NewsItem } from "~/components/news-item";
import { InfiniteScroller } from "~/lib/infinite-scroller";
import { LoadingIndicator } from "~/lib/loading-indicator";
import { getTopHeadlines } from "~/lib/new-api";

const categories = [
  "business",
  "entertainment",
  "general",
  "health",
  "science",
  "sports",
  "technology",
] as const;

const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.enum(categories).optional(),
  page: z.coerce.number().optional().default(1),
});

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const { q, category, page } = searchParamsSchema.parse(
    Object.fromEntries(url.searchParams)
  );

  let articles = await getTopHeadlines({
    language: "en",
    page,
    q,
    category,
  });

  return json(articles, {
    headers: {
      "Cache-Control": "public, max-age=60", // 1 minute
    },
  });
}

export let headers = ({ loaderHeaders }: { loaderHeaders: Headers }) => {
  return {
    "Cache-Control": loaderHeaders.get("Cache-Control"),
  };
};

export default function Index() {
  const routeData = useLoaderData<typeof loader>();
  const [articles, setArticles] = useState(routeData.articles);

  const [searchParams, setSearchParams] = useSearchParams();

  const fetcher = useFetcher<typeof loader>();

  const page = useRef(1);

  const { data } = fetcher;

  useEffect(() => {
    if (data?.articles?.length) {
      setArticles((prevItems) => [...prevItems, ...data.articles]);
    }
  }, [data]);

  useEffect(() => {
    setArticles(routeData.articles);
  }, [routeData.articles]);

  const setFilter = useCallback(
    (name: string, value: string) => {
      const newSearchParams = new URLSearchParams(searchParams);

      if (value) {
        newSearchParams.set(name, value);
      } else {
        newSearchParams.delete(name);
      }

      setSearchParams(newSearchParams);
    },
    [searchParams, setSearchParams]
  );

  let timeout = useRef<ReturnType<typeof setTimeout>>();

  const onQueryChange = useCallback(
    (value: string) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      timeout.current = setTimeout(() => {
        setFilter("q", value);
      }, 500);
    },
    [setFilter]
  );

  return (
    <div className="p-4 pb-0 flex flex-col gap-4 h-[100vh] ">
      <div className="flex flex-col gap-4">
        <input
          defaultValue={searchParams.get("q") || ""}
          onChange={(e) => {
            onQueryChange(e.target.value);
          }}
          type="search"
          placeholder="Search"
          className="border border-gray-300 rounded-md p-2"
        />
        <ul className="grid grid-cols-3 gap-2">
          {categories.map((category) => {
            return (
              <li key={category}>
                <button
                  className={clsx(
                    `border w-full border-green-300 rounded-md p-2 flex items-center
                justify-center bg-green-200 text-green-900
              hover:bg-green-300 hover:text-green-900 transition-colors duration-200 ease-in-out`,
                    {
                      "bg-green-500 text-green-50":
                        searchParams.get("category") === category,
                    }
                  )}
                  type="button"
                  onClick={() => {
                    if (searchParams.get("category") === category) {
                      setFilter("category", "");
                    } else {
                      setFilter("category", category);
                    }
                  }}
                >
                  {category}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <main className="flex-1 p-0 m-0">
        <InfiniteScroller
          loading={fetcher.state === "loading"}
          loadNext={() => {
            if (fetcher.state === "loading") return;
            page.current += 1;
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("page", page.current.toString());

            fetcher.load(`/?index&${newSearchParams.toString()}`);
          }}
        >
          <ul className="flex flex-col gap-4">
            {articles.map((article) => {
              return (
                <li key={article?.title}>
                  <NewsItem {...article} />
                </li>
              );
            })}
          </ul>
        </InfiniteScroller>
        {articles.length === 0 ? (
          <div className="p-4 flex items-center justify-center">
            <span className="text-gray-500">No articles found</span>
          </div>
        ) : null}

        {fetcher.state === "loading" ? <LoadingIndicator /> : null}
      </main>
    </div>
  );
}
