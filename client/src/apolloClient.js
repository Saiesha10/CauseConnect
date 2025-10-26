import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// ✅ Use your deployed Render backend or local server
const GRAPHQL_HTTP =
  import.meta.env.VITE_GRAPHQL_HTTP ||
  "https://causeconnect-787i.onrender.com/graphql";

const httpLink = createHttpLink({
  uri: GRAPHQL_HTTP,
});

// ✅ Add JWT Auth if present
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("cc_token")?.trim();
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

console.log("✅ Connected to GraphQL Endpoint:", GRAPHQL_HTTP);

export default client;
