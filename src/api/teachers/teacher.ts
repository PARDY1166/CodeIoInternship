import express from "express";
import { signin, signup } from "../controllers/teacherController";

export const api = express();

api.post("/signin", signin);
api.post("/signup", signup);