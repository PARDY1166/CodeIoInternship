import express from "express";
import { api as studentApi } from "./student";
import { api as teacherApi } from "./teacher";

export const api = express();

api.use("/students", studentApi);
api.use("/teachers", teacherApi);
