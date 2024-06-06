import express from "express";
import { api as studentApi } from "./students/student";
import { api as teacherApi } from "./teachers/teacher";

export const apis = express();

apis.use("/students", studentApi);
apis.use("/teachers", teacherApi);
