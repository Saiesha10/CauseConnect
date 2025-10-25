import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// Use environment variable if available, otherwise default to your deployed backend
const GRAPHQL_HTTP =
  import.meta.env.VITE_GRAPHQL_HTTP || "https://causeconnect-787i.onrender.com/graphql";

// Create HTTP link to your GraphQL server
const httpLink = createHttpLink({
  uri: GRAPHQL_HTTP,
});

// Attach Authorization header if user token exists
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("cc_token")?.trim();
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Create Apollo Client instance
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Optional: log for debugging
console.log("✅ Connected to GraphQL Endpoint:", GRAPHQL_HTTP);

export default client;
