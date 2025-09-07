import { Router } from "express";
const commonRouteList = Router();
import { videoRoute } from "./video.routes.js";

commonRouteList.use("/video", videoRoute );

export { commonRouteList };
