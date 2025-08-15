const Catch_Error = (error: unknown) => {
  if (error instanceof Error) {
    return error;
  }
  return new Error('Тодорхойгүй алдаа гарлаа!');
};

export default Catch_Error;
