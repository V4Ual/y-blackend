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
      { user: isUserExist._id },
      "15min"
    );

    const refreshToken = await jwtUtil.generateToken(
      { user: isUserExist._id },
      "180 days"
    );

    await isUserExist.setToken(accessToken, refreshToken);

    return responses.success(messages.loginSuccess, isUserExist);
  };
}

export default AuthService;
