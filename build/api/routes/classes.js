"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../controllers/middleware");
const classController_1 = require("../controllers/classController");
// Any endpoint here hits the /c/ endpoint
exports.api = (0, express_1.default)();
exports.api.use(middleware_1.authMiddleware);
exports.api.get("/", classController_1.getAllClasses);
exports.api.post("/", classController_1.addNewClass);
exports.api.post("/addStudent", classController_1.addStudent);
