import { Router } from "express";
import { userModule } from "../../../controllers/index.js";
const authRoute = Router();
const authCtl = new userModule.authCtl();

authRoute.post("/login", async (req, res) => {
  const result = await authCtl.login(req, res);
  return res.status(result.statusCode).send(result);
});

authRoute.post("/refresh", async (req, res) => {
  const result = await authCtl.refreshToken(req, res);
  return res.status(result.statusCode).send(result);
});

export { authRoute };
