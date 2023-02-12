import { Dialog } from "@headlessui/react";
import {
  useLoaderData,
  useMatches,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { z } from "zod";
import { type loader } from ".";

export default function Article() {
  const navigate = useNavigate();

  const { title } = z
    .object({
      title: z.string(),
    })
    .parse(useParams());

  const matches = useMatches();

  console.log("@@", matches);
  const articles = matches.find((match) => match.pathname === "/")?.data;
  const article = articles?.find((article) => article.title === title);

  return (
    <Dialog open={true} onClose={() => navigate(-1)}>
      <Dialog.Panel>
        <Dialog.Title>{article?.title}</Dialog.Title>
        <Dialog.Description>{article?.description}</Dialog.Description>

        <p>{article?.content}</p>
      </Dialog.Panel>
    </Dialog>
  );
}
