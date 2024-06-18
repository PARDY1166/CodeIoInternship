import express from "express";
import { register } from "../controllers/registerController";

export const api = express();
api.post("/", register)