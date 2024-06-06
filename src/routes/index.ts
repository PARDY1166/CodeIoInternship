import express from "express";
import { apis } from "../api/api";

export const api = express();

api.use("/api", apis);
