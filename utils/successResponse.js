class SuccessResponse {
  statusCode;
  data;

  constructor(data, statusCode = 200) {
    this.statusCode = statusCode;
    this.data = data;
  }
}

module.exports = SuccessResponse;
