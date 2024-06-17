"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../controllers/middleware");
const courseController_1 = require("../controllers/courseController");
// Any endpoint here hits the /courses/ endpoint
exports.api = (0, express_1.default)();
exports.api.use(middleware_1.authMiddleware);
exports.api.post("/", courseController_1.addNewCourse);
exports.api.get("/", courseController_1.getAllCourses);
exports.api.post("/addClass", courseController_1.createUndertaking);
