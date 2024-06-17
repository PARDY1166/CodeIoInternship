"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUndertaking = exports.addNewCourse = exports.getAllCourses = void 0;
const db_1 = __importDefault(require("../../utils/db"));
const getAllCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userRole } = req;
    if (userRole === "student")
        return res.status(403).json({
            err: "not authorized!",
        });
    try {
        const response = yield db_1.default.course.findMany();
        return res.status(200).json(response);
    }
    catch (e) {
        return res.status(404).json({
            err: "error: " + e.message,
        });
    }
});
exports.getAllCourses = getAllCourses;
const addNewCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userRole } = req;
    if (userRole !== "admin")
        return res.status(403).json({
            err: "only admin is allowed to add course!",
        });
    const { courseName, courseCode } = req.body;
    try {
        const exists = yield db_1.default.course.findFirst({
            where: {
                courseCode,
            },
        });
        if (exists)
            return res.status(400).json({
                err: "course already exists!",
            });
        yield db_1.default.course.create({
            data: {
                courseName,
                courseCode,
            },
        });
        return res.status(200).json({
            msg: "success!",
        });
    }
    catch (e) {
        return res.status(400).json({
            err: "error: " + e.message,
        });
    }
});
exports.addNewCourse = addNewCourse;
const createUndertaking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseCode, teacherId, classId } = req.body;
    if (!courseCode || !teacherId || !classId)
        res.status(400).json({
            err: "invalid input! missing values!",
        });
    try {
        const exists = yield db_1.default.courseUndertaken.findFirst({
            where: {
                AND: [{ courseCode }, { classId }],
            },
        });
        if (exists) {
            yield db_1.default.courseUndertaken.update({
                data: { teacherId },
                where: {
                    courseObjId: exists.courseObjId,
                },
            });
            return res.status(200).json({
                msg: "teacher updated successfully!",
            });
        }
        yield db_1.default.courseUndertaken.create({
            data: {
                courseCode,
                teacherId,
                classId,
            },
        });
        return res.status(200).json({
            msg: "successfully created new course undertaking!",
        });
    }
    catch (e) {
        return res.status(400).json({
            err: "error: " + e.message,
        });
    }
});
exports.createUndertaking = createUndertaking;
