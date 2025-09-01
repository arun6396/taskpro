module.exports = (data = {}, code = 200, message = "Success", token = null) => {
  return {
    session: {
      token: token,
      validity: token ? 3600 : 0, // 1 hour in seconds if token exists
      specialMessage: null,
    },
    data: data,
    status: {
      code: code,
      status: code >= 400 ? "Error" : "Success",
      message: message || (code === 200 ? "Request successful" : "An error occurred"),
    },
  };
};
