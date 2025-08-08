import { GraphQLError } from 'graphql';

const Catch_Error = (error: unknown) => {
  if (error instanceof GraphQLError) {
    return error;
  }
  return new GraphQLError('Тодорхойгүй алдаа гарлаа!');
};

export default Catch_Error;
