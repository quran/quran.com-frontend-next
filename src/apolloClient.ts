import Cookies from 'universal-cookie';
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import * as Sentry from '@sentry/node';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { SentryLink } from 'apollo-link-sentry';

import { onError } from '@apollo/link-error';
import { setContext } from '@apollo/link-context';

import { useMemo } from 'react';
import { API_URL } from './constants';
import useToasts from './hooks/useToasts';

let apolloClient: ApolloClient<NormalizedCacheObject>;

type ErrorCallback = (data: { title: string; message: string; level: string }) => void;

const createLink = (errorCallback: ErrorCallback) => {
  const httpLink = createHttpLink({ uri: `${API_URL}/graphql` });

  const errorLink = onError((opts) => {
    const { operation, networkError, graphQLErrors } = opts;

    if (networkError) {
      errorCallback({
        title: 'Network Error',
        message: `${networkError}`,
        level: 'error',
      });

      Sentry.withScope((scope) => {
        if (operation.variables && operation.variables.data) {
          Object.entries(operation.variables.data).forEach(([key, val]) => {
            scope.setExtra(`data: ${key}`, val);
          });
        }
        scope.setExtra('operationName', operation.operationName);

        console.log(`[Network error]: ${networkError}`);
        // @ts-ignore
        if (networkError.response) {
          // @ts-ignore
          scope.setExtra('url', networkError.response?.url ?? null);

          // @ts-ignore
          Object.entries(networkError.response.headers).forEach(([key, val]) => {
            scope.setExtra(`headers: ${key}`, val);
          });
        }
        // @ts-ignore
        scope.setExtra('result', JSON.stringify(networkError.result));
        // @ts-ignore
        scope.setTag('statusCode', networkError.statusCode);
        // @ts-ignore
        scope.setTag('statusText', networkError.statusText);

        try {
          Sentry.captureException(networkError);
        } catch (e) {
          Sentry.captureException(e);
        }
      });
    }

    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        errorCallback({
          title: 'GraphQL Error',
          message,
          level: 'error',
        });
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
      });
    }
  });

  const authLink = setContext((np, { headers }) => {
    const cookies = new Cookies();
    const authToken = cookies.get('jwt');

    return {
      headers: {
        ...headers,
        authorization: authToken ? `Bearer ${authToken}` : '',
        a: cookies.get('a'),
      },
    };
  });

  const sentryLink = new SentryLink({
    breadcrumb: {
      includeQuery: true,
      includeVariables: true,
      includeError: true,
      includeResponse: true,
      // includeCache: true,
    },
  });

  // TODO:@mo fix this
  // @ts-ignore
  return ApolloLink.from([authLink, sentryLink, errorLink, httpLink]);
};

const createApolloClient = (errorCallback: ErrorCallback) => {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    // TODO:@mo fix this
    // @ts-ignore
    link: createLink(errorCallback),
    cache: new InMemoryCache(),
  });
};

type InitializeApollo = (
  initialState?: NormalizedCacheObject,
  errorCallback?: ErrorCallback,
) => ApolloClient<NormalizedCacheObject>;

export const initializeApollo: InitializeApollo = (
  initialState = null,
  errorCallback = (error) => {
    console.log(error);
  },
) => {
  const privateApolloClient = apolloClient ?? createApolloClient(errorCallback);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    privateApolloClient.cache.restore(initialState);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return privateApolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = privateApolloClient;

  return privateApolloClient;
};

export function useApollo(initialState) {
  const { addToast } = useToasts();
  const store = useMemo(
    () => initializeApollo(initialState, (error) => addToast(error.message, 'danger', error)),
    [addToast, initialState],
  );

  return store;
}
