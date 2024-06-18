import express from "express";
import { login } from "../controllers/loginController";

export const api = express();
api.post("/", login)