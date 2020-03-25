import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { RestLink } from 'apollo-link-rest';
import fetch from 'isomorphic-unfetch';
import { makeUrl } from './api';

export default function createApolloClient(initialState, ctx) {
  // @ts-ignore
  if (global.Headers == null) {
    // @ts-ignore
    global.Headers = require('fetch-headers');
  }

  const restLink = new RestLink({
    uri: makeUrl(''),
    customFetch: fetch,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // The `ctx` (NextPageContext) will only be present on the server.
  // use it to extract auth headers (ctx.req) or similar.
  return new ApolloClient({
    ssrMode: Boolean(ctx),
    // @ts-ignore
    link: restLink,
    cache: new InMemoryCache().restore(initialState),
  });
}
