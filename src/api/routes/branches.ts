import express from "express";
import { authMiddleware } from "../controllers/middleware";
import { addNewBranch, deleteBranch, getAllBranches, updateBranch } from "../controllers/branchController";

// Any endpoint here hits the /branches/ endpoint

export const api = express();
api.use(authMiddleware);
api.post("/", addNewBranch);
api.put("/", updateBranch);
api.get("/", getAllBranches);
api.delete("/", deleteBranch)