import express from "express";
import { apis } from "./api";

export const api = express();

api.use("/api", apis);
