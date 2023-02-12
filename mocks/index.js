const { setupServer } = require("msw/node");
const { rest } = require("msw");
const { faker } = require("@faker-js/faker");

const newApiRoutes = [
  rest.get("https://newsapi.org/v2/top-headlines", (req, res, ctx) => {
    let page = req.url.searchParams.get("page");

    if (page >= 4) {
      return res(
        ctx.status(200),
        ctx.json({
          status: "error",
          code: "no-more-results",
          message: "No more results",
        })
      );
    }

    const articles = Array.from({ length: 20 }).map((_, index) => ({
      source: {
        id: faker.random.numeric(),
        name: faker.company.name(),
      },
      author: faker.name.fullName(),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      url: faker.internet.url(),
      urlToImage: faker.image.imageUrl(),
      publishedAt: faker.date.past(),
      content: faker.lorem.paragraph(),
    }));

    return res(
      ctx.status(200),
      ctx.json({
        status: "ok",
        totalResults: 20,
        articles,
      })
    );
  }),
];

const server = setupServer(...newApiRoutes);

server.listen({ onUnhandledRequest: "bypass" });

console.info("🔶 Mock server running");

process.once("SIGINT", () => server.close());
process.once("SIGTERM", () => server.close());
