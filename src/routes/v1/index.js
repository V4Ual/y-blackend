import { Router } from "express";
const versionV1RouteList = Router();
import { userRouteList } from "./user/index.js";
import { commonRouteList } from "./common/index.js";

versionV1RouteList.use("/user", userRouteList);
versionV1RouteList.use("/", commonRouteList );

export { versionV1RouteList };
