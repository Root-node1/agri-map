class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

module.exports = ApiResponse;
