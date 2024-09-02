const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .then((result) => {
      res.status(result.statusCode).json(result.data);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = asyncWrapper;
