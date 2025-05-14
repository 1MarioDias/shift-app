//  create error handler function
class ErrorHandler extends Error {
    constructor(statusCode, message) {
      super();
      this.statusCode = statusCode;
      this.message = message;
    }
  }
  module.exports = {
    ErrorHandler
  }