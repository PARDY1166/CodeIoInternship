import express from "express";
import { api as studentApi } from "./students";
import { api as teacherApi } from "./teachers";
import { api as branchApi } from "./branches";
import { api as adminApi } from "./admins";
import { api as classApi } from "./classes";
import {api as courseApi} from "./courses";
import {api as loginApi} from "./login";

// At endpoint /api

export const apis = express();

apis.use("/s", studentApi);
apis.use("/t", teacherApi);
apis.use("/a", adminApi);
apis.use("/b", branchApi);
apis.use("/c", classApi);
apis.use("/courses", courseApi)
apis.use("/login", loginApi)
