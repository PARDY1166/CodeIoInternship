import express from "express";
import { signin, signup } from "../controllers/studentController";

// Any endpoint here hits the /student/ endpoint

export const api = express();

api.post("/signin", signin);
api.post("/signup", signup);

