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
    res.cookie("access_token", result.data._doc.access_token, {
      maxAge: 3600000,
      httpOnly: true,
    }); // expires in 1 hour

    return result;
  };
}

export default AuthController;
