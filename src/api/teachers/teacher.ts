import express from "express";
import { getAllTeachers, getSpecificTeacher, signin, signup } from "../controllers/teacherController";

export const api = express();

api.post("/signin", signin);
api.post("/signup", signup);
api.get("/", getAllTeachers);
api.get("/:empid", getSpecificTeacher);