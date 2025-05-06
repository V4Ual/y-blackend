import { userService } from "../../../services/index.js";

class AuthController {
  #authService;
  constructor() {
    this.#authService = userService.userService.authService;
  }

  login = async (req, res) => {
    const { email, password } = req.body;
    const prepareData = {
      email: email,
      password: password,
    };

    const result = await this.#authService.login(prepareData);

    if (result.statusCode === 200) {
      res.cookie("refresh_token", result.data._doc.refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        // path: "/refresh",
      });
    }

    return result;
  };

  refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    const result = await this.#authService.refreshTokenCheck(refreshToken);
    return result;
  };
}

export default AuthController;
