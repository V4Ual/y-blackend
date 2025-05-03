import { Router } from "express";
const routerList = Router();
import { versionV1RouteList } from "./v1/index.js";

routerList.use("/v1", versionV1RouteList);

export default routerList;
