import type { IncomingMessage, ServerResponse } from "http";
import {
   ApolloClient,
   InMemoryCache,
   ApolloLink,
   HttpLink,
   DocumentNode,
} from "@apollo/client";
import { RetryLink } from "@apollo/client/link/retry";
import { ErrorLink } from "@apollo/client/link/error";
import type { GraphQLError } from "graphql";
import { draftMode } from "next/headers";

// --- Types ---
export type ResolverContext = {
   req?: IncomingMessage;
   res?: ServerResponse;
};

interface ErrorResponse {
   errors?: readonly GraphQLError[];   // new GraphQL error array
   error?: Error;                      // new single network-level error
   response?: Record<string, any>;
   operation: ApolloLink.Operation;
   forward: ApolloLink.ForwardFunction;
}

const errorLink = new ErrorLink((error: ErrorResponse) => {
   // --- GraphQL-level errors (from the server) ---
   if (error.errors?.length) {
      for (const { message, locations, path } of error.errors) {
         console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
         );
      }
   }

   // --- Network-level errors (transport, CORS, etc.) ---
   if (error.error) {
      console.error(`[Network error]: ${error.error.message}`);
   }
});

// --- Retry Delay Function ---
const RetryDelay = (operation: any) => {
   const { response } = operation.getContext();
   const delay = response?.headers?.get("X-contentful-RateLimit-Reset");

   if (delay) {
      console.warn("Contentful rate limit: too many requests");
      return Number(delay) * 1000; // Convert seconds to ms
   } else {
      // random small delay between 1–3s for transient errors
      return (Math.random() * 3 + 1) * 1000;
   }
};

// --- Retry Link ---
const Retry = new RetryLink({
   delay: {
      initial: 300,
      max: Infinity,
      jitter: true,
   },
   attempts: {
      max: 3,
      retryIf: (error, operation) => {
         if (error) {
            console.log("Retry condition triggered:", JSON.stringify(error));
            if ((error as any).statusCode === 400) {
               return false;
            }
         }
         return !!error && !!RetryDelay(operation);
      },
   },
});

// --- HTTP Link ---
const Http = new HttpLink({
   uri: process.env.CF_API_URL,
   headers: {
      "Content-Language": "en-US",
   },
   credentials: "same-origin",
});

// --- Auth Link (modern replacement for deprecated setContext) ---
const authLink = new ApolloLink((operation, forward) => {
   const context = operation.getContext();
   const authorization = context.preview
      ? process.env.CF_PREV_AUTH
      : process.env.CF_AUTH;

   operation.setContext({
      headers: {
         ...context.headers,
         authorization: `Bearer ${authorization}`,
      },
   });

   return forward(operation);
});

// --- Apollo Client Factory ---
export const CreateApolloClient = (): ApolloClient => {
   return new ApolloClient({
      ssrMode: typeof window === "undefined",
      link: ApolloLink.from([errorLink, Retry, authLink, Http]),
      cache: new InMemoryCache(),
   });
};

// --- Execute Query ---
export const ExecuteQuery = async (
   query: DocumentNode,
   { variables = {}, preview = false }: { variables?: any; preview: boolean }
): Promise<any> => {
   const client = CreateApolloClient();

   const result = await client.query({
      query,
      errorPolicy: "all",
      fetchPolicy: "no-cache",
      variables: { preview, ...variables },
      context: { preview },
   });

   if (preview) {
      const draft = await draftMode();
      draft.disable();
   }


   return result?.data;
};