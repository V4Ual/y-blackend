import { messages } from "../constant/index.js";
import responses from "../responses/index.js";
import { jwtUtil } from "../utils/jwtUtils.js";

const bearerToken = async (req) => {
  const { authorization } = req.headers;
  let isValid = false;
  let message = "Invalid Token";
  if (!authorization) {
    return {
      isValid: false,
      message: messages.tokenNotProvided,
    };
  }

  let parts = authorization.split(" ");
  let [schema, token] = parts;
  if (schema.startsWith("Bearer ") || parts.length === 2) {
    isValid = false;
    message = messages.tokenInvalid;
  }

  const decodeData = await jwtUtil
    .verity(token)
    .then((value) => {
      req.headers.userDetails = value;
      return {
        isValid: true,
        message: message.tokenValid,
      };
    })
    .catch((error) => {
      return {
        isValid: false,
        message: error.message,
        isExpire: true,
      };
    });

  return decodeData;
};

export const authCheck = async (req, res, next) => {
  const isTokenVerify = await bearerToken(req);

  if (isTokenVerify?.isExpire) {
    return res.status(498).send(responses.invalidToken(isTokenVerify.message));
  }

  if (isTokenVerify.isValid) {
    next();
  } else {
    return res.send(responses.badRequest(isTokenVerify.message));
  }
};
