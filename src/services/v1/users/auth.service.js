import { db } from "../../../config/db.config.js";
import { messages } from "../../../constant/message.js";
import responses from "../../../responses/index.js";
import { jwtUtil } from "../../../utils/jwtUtils.js";

class AuthService {
  static login = async (userObject) => {
    const { email, password } = userObject;
    const isUserExist = await db.user.findOne({ email: email });

    if (!isUserExist || !(await isUserExist.comparePassword(password))) {
      return responses.badRequest(messages.passwordMismatch);
    }

    delete isUserExist._doc.password;
    const accessToken = await jwtUtil.generateToken(
      { userId: isUserExist._id },
      "30s"
    );

    const refreshToken = await jwtUtil.generateToken(
      { userId: isUserExist._id },
      "180 days"
    );

    await isUserExist.setToken(accessToken, refreshToken);

    return responses.success(messages.loginSuccess, isUserExist);
  };

  static refreshTokenCheck = async (refreshToken) => {
    const decodeData = await jwtUtil
      .verity(refreshToken)
      .then((value) => {
        return value;
      })
      .catch((error) => {
        return false;
      });

      console.log(decodeData)
    if (decodeData?.userId) {
      const accessToken = await jwtUtil.generateToken(
        { userId: decodeData.userId },
        "15min"
      );
      console.log({ accessToken });
      return responses.success("Generate new access token", { accessToken });
    } else {
      return responses.UnAuthorization("Access danial");
    }
  };
}

export default AuthService;
