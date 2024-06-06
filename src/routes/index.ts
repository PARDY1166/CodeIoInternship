import express from "express";

export const api = express();

import {api as studentApi} from "./student"
import {api as teacherApi} from "./teacher";

api.use('/student', studentApi);
api.use('/teacher', teacherApi);