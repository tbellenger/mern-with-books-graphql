const express = require("express");
const path = require("path");
const db = require("./config/connection");
//const routes = require("./routes");
// import apollo server
const { ApolloServer } = require("apollo-server-express");
//const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");

const { typeDefs, resolvers } = require("./schema");
const { authMiddleware } = require("./utils/auth");

const app = express();
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  //const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
    //plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({ app });

  // await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
};

startServer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

// serve up react front-end in production
if (process.env.NODE_ENV === "production") {
  router.use((req, res) => {
    res.sendFile(path.join(__dirname, "../../client/build/index.html"));
  });
}

db.once("open", () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
