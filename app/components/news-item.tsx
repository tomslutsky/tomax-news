import { formatDate } from "~/lib/datetime-format";
import { type Article } from "~/lib/new-api";
import { trancate } from "~/lib/truncate";

export function NewsItem(article: Article) {
  return (
    <div className="border border-gray-300 rounded-md p-4 flex flex-col gap-4 shadow">
      <span className="text-lg font-bold">{article?.title}</span>
      <time className="text-gray-500" dateTime={article?.publishedAt}>
        {article?.publishedAt && formatDate(new Date(article?.publishedAt))}
      </time>
      <div className="h-60 bg-gray-100 -mx-4">
        {article?.urlToImage ? (
          <img
            src={article?.urlToImage}
            alt={article?.title}
            className="object-cover h-full w-full"
          />
        ) : null}
      </div>
      <p>{trancate(article?.description || "", 80)}</p>
    </div>
  );
}
