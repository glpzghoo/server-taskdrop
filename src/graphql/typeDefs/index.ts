import fs from 'fs';
import path from 'path';
import { gql } from 'graphql-tag';

const typeDefsDir = path.join(__dirname);

const typeDefs = fs
  .readdirSync(typeDefsDir)
  .filter((file) => file.endsWith('.graphql'))
  .map((file) => fs.readFileSync(path.join(typeDefsDir, file), 'utf8'))
  .join('\n');

export const mergedTypeDefs = gql`
  ${typeDefs}
`;
