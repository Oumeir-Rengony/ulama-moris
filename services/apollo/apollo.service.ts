import type { IncomingMessage, ServerResponse } from 'http';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from "@apollo/client/link/retry";
import { setContext } from "@apollo/client/link/context";
import {
  from,
  HttpLink,
  ApolloClient,
  DocumentNode,
  InMemoryCache,
  NormalizedCacheObject,
  ApolloQueryResult,
} from '@apollo/client';

import config from "@config/config.json";


export type ResolverContext = {
  req?: IncomingMessage
  res?: ServerResponse
};


const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    )
  if (networkError) console.log(`[Network error]: ${networkError}`)
});


//Delay of retry on error
const RetryDelay = (operation: any) => {
  console.log("RetryDelay = " + JSON.stringify(operation));
  console.log("RetryDelay operation.getContext() = " + operation.getContext());
  const { response } = operation.getContext();
  //check if contentful send the delay
  let delay = response && response.headers && response.headers.get('X-contentful-RateLimit-Reset');
  if (delay) {
    console.warn("contentful error : too many request")
    return delay
  } else {
    //connection error
    return (Math.random() * 3) + 1;
  }
};


const Retry = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true
  },
  attempts: {
    max: 5,
    retryIf: (error, _operation) => {
      //Incorrect request
      if (error) {
        console.log("ERROR RETRYIF", JSON.stringify(error))
        if (error.statusCode === 400) {
          return false;
        }
      }
      const retryValue = RetryDelay(_operation);
      return !!error && retryValue;
    }
  }
});


const Http = new HttpLink({
  uri: `${config.contentful.host}/${process.env.NEXT_PUBLIC_CF_SPACE_ID}/environments/${process.env.NEXT_PUBLIC_CF_ENV_ID}`,
  headers: {
    'Content-Language': `${config.contentful.locale}`,
  },
  credentials: 'same-origin',
});


const authLink = setContext((_, { headers, preview }) => {
  const authorization = preview 
    ? process.env.NEXT_PUBLIC_CF_PREV_AUTH 
    : process.env.NEXT_PUBLIC_CF_AUTH

  return {
      headers: {
        ...headers,
        authorization: `Bearer ${authorization}`,
      }
  }
});


export const CreateApolloClient = ():ApolloClient<NormalizedCacheObject> => {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([errorLink, Retry, authLink, Http]),
    cache: new InMemoryCache()
  })
};


export const ExecuteQuery = async (query: DocumentNode, { variables = {} , preview = false }) => {
  const client = CreateApolloClient();
  const result = await client.query({ 
    query: query, 
    errorPolicy: "all", 
    fetchPolicy: 'cache-first',
    variables,
    context: { preview } 
  }) as ApolloQueryResult<any>;

  return result?.data;
};