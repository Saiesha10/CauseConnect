import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";


const GRAPHQL_HTTP =
  import.meta.env.VITE_GRAPHQL_HTTP ||
  "https://causeconnect-vskr.onrender.com/graphql";


const httpLink = createHttpLink({
  uri: GRAPHQL_HTTP,
});


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

console.log(" Connected to GraphQL Endpoint:", GRAPHQL_HTTP);

export default client;
