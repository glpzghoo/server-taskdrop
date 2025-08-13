import express from 'express';
import 'dotenv/config';
import { initGraphQL } from './graphql/graphql';

const app = express();

const startServer = async () => {
  const graphql = await initGraphQL();

  app.use('/graphql', graphql);

  app.use('/', (_req, res) => {
    res.send('oops');
  });

  app.listen(4000, () => {
    console.log('graphql сервер аслаа -> http://localhost:4000/graphql');
  });
};

startServer();
