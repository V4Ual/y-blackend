export default {
  success: (message, data) => {
    return {
      status: true,
      statusCode: 200,
      message: message,
      data: data,
      err: {},
    };
  },
  badRequest: (message) => {
    return {
      status: true,
      statusCode: 400,
      message: message,
      data: {},
      err: {},
    };
  },

  internalServer: (message,err) => {
    return {
      status: true,
      statusCode: 500,
      message: message,
      data: {},
      err: err,
    };
  },
};
