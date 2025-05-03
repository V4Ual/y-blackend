import { Router } from "express";
import { userModule } from "../../../controllers/index.js";
import { errorUtil } from "../../../utils/errorUtils.js";
import { authCheck } from "../../../middleware/index.js";
const userRoute = Router();
const userCtl = new userModule.userCtl();

userRoute.post(
  "/register",
  errorUtil(async (req, res) => {
    const result = await userCtl.register(req);
    return res.status(result.statusCode).send(result);
  })
);

userRoute.get(
  "/details",
  errorUtil(authCheck),
  errorUtil(async (req, res) => {
    const result = await userCtl.details(req);
    return res.status(result.statusCode).send(result);
  })
);

userRoute.get(
  "/",
  errorUtil(authCheck),
  errorUtil(async (req, res) => {
    const result = await userCtl.details(req);
    return res.status(result.statusCode).send(result);
  })
);





export { userRoute };
