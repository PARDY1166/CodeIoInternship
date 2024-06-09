import express from "express";
import { api as studentApi } from "./students";
import { api as teacherApi } from "./teachers";
import { api as branchApi } from "./branches";
import { api as adminApi } from "./admins";

export const apis = express();

apis.use("/s", studentApi);
apis.use("/t", teacherApi);
apis.use("/a", adminApi);
apis.use("/branches", branchApi);
