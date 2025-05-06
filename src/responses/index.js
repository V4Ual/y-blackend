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
      status: false,
      statusCode: 400,
      message: message,
      data: {},
      err: {},
    };
  },

  UnAuthorization: (message) => {
    return {
      status: false,
      statusCode: 401,
      message: message,
      data: {},
      err: {},
    };
  },

  internalServer: (message, err) => {
    return {
      status: false,
      statusCode: 500,
      message: message,
      data: {},
      err: err,
    };
  },

  invalidToken: (message, err) => {
    return {
      status: false,
      statusCode: 498,
      message: message,
      data: {},
      err: err,
    };
  },
};
