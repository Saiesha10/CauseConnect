import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";


// GraphQL endpoint from Vite env
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL,
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "x-hasura-admin-secret": import.meta.env.VITE_HASURA_ADMIN_SECRET,
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
console.log("GraphQL URL:", import.meta.env.VITE_HASURA_GRAPHQL_URL);

export default client;
