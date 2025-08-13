import express, { Router } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import { mergedTypeDefs } from './typeDefs';
import { queries, mutations } from '.';

export const initGraphQL = async () => {
  const graphql = Router();

  const server = new ApolloServer({
    typeDefs: mergedTypeDefs,
    resolvers: {
      Query: queries,
      Mutation: mutations,
    },
    introspection: true,
  });

  await server.start();

  graphql.use(
    cors({
      origin: process.env.PRODUCTION
        ? 'https://task-drop.glpzghoo.space'
        : 'http://localhost:3000',
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return { req, res };
      },
    })
  );

  graphql.use((_req, res) => {
    res.status(404).send('oops');
  });

  return graphql;
};
