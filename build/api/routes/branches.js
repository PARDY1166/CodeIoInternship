"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../controllers/middleware");
const branchController_1 = require("../controllers/branchController");
// Any endpoint here hits the /branches/ endpoint
exports.api = (0, express_1.default)();
exports.api.use(middleware_1.authMiddleware);
exports.api.post("/", branchController_1.addNewBranch);
exports.api.put("/", branchController_1.updateBranch);
exports.api.get("/", branchController_1.getAllBranches);
exports.api.delete("/", branchController_1.deleteBranch);
