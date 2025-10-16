import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const GRAPHQL_HTTP = import.meta.env.VITE_GRAPHQL_HTTP || "http://localhost:4000/graphql";

const httpLink = createHttpLink({
  uri: GRAPHQL_HTTP,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("cc_token")?.trim(); // ensure no extra spaces
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "", // uppercase 'Authorization' is standard
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
 export default client;