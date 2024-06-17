"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const studentController_1 = require("../controllers/studentController");
const middleware_1 = require("../controllers/middleware");
// Any endpoint here hits the /s/ endpoint
exports.api = (0, express_1.default)();
exports.api.post("/signin", studentController_1.signin);
exports.api.post("/signup", studentController_1.signup);
exports.api.use(middleware_1.authMiddleware);
exports.api.get("/", studentController_1.getAllStudents);
exports.api.get("/:studentId", studentController_1.getSpecificStudent);
exports.api.get("/usn/:usn", studentController_1.getSpecificStudentByUsn);
exports.api.put("/:studentId", studentController_1.updateStudentDetails);
