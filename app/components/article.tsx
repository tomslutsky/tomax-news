import { formatDate } from "~/lib/datetime-format";
import { type Article } from "~/lib/new-api";

export function ArticleComponent(
  props: Article & {
    onClose: () => void;
  }
) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <h1 className="text-lg font-bold">{props.title}</h1>
      <time className="text-gray-500" dateTime={props.publishedAt}>
        {props.publishedAt && formatDate(new Date(props.publishedAt))}
      </time>
      <p>{props.author}</p>
      <div className="h-60 bg-gray-100">
        {props.urlToImage ? (
          <img
            src={props.urlToImage}
            alt={props.title}
            className="object-cover h-full w-full"
          />
        ) : null}
      </div>

      <p className="text-gray-500 font-semibold">{props.description}</p>
      <p>{props.content}</p>
    </div>
  );
}
