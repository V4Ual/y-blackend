import { Router } from "express";
import { userModule } from "../../../controllers/index.js";
import { imageUpload } from "../../../utils/index.js";
const channelRoute = Router();
const channelCtl = new userModule.channelCtl();
const upload = imageUpload.uploadImage();

channelRoute.post(
  "/create",
  upload.fields([
    { name: "banner", maxCount: "1" },
    { name: "profilePic", maxCount: "1" },
  ]),
  async (req, res) => {
    // console.log(req.files)
    // channelCtl.register
    // const result = await authCtl.login(req, res);
    // return res.status(result.statusCode).send(result);
  }
);

export { channelRoute };
