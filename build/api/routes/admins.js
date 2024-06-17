"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const middleware_1 = require("../controllers/middleware");
// Any endpoint here hits the /a/ endpoint
exports.api = (0, express_1.default)();
exports.api.post("/signin", adminController_1.signin);
exports.api.post("/signup", adminController_1.signup);
exports.api.use(middleware_1.authMiddleware);
exports.api.get("/:employeeId", adminController_1.getAdminInfo);
exports.api.put("/:adminId", adminController_1.updateInfo);
exports.api.post("/upload", adminController_1.upload.single('file'), adminController_1.uploadTeacherDetails);
