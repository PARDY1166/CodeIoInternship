import express from "express";
const indexRouter = express.Router();

import {router as studentRouter} from "./student"
import {router as teacherRouter} from "./teacher";

indexRouter.use('/student', studentRouter);
indexRouter.use('/teacher', teacherRouter);

export {indexRouter};
