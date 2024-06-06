import { signin, signup } from "../controllers/studentController";
import express from "express";

export const api = express();

api.post("/signin", signin);
api.post("/signup", signup);
