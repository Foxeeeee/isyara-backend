export class HttpException extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
  }
}

export const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpException) {
    return res.status(err.status).json({ message: err.message }).end();
  } else {
    return res.status(500).json({ message: err.message }).end();
  }
};
