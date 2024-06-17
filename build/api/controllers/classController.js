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
exports.addStudent = exports.addNewClass = exports.getAllClasses = void 0;
const db_1 = __importDefault(require("../../utils/db"));
const getAllClasses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userRole } = req;
    if (userRole === "student")
        return res.status(403).json({
            err: "not authorized!",
        });
    const { branchId, semester, section, yearOfAdmission } = req.query;
    try {
        const response = yield db_1.default.class.findMany({
            where: {
                branchId: branchId ? branchId : undefined,
                semester: semester ? ("a" + semester) : undefined,
                section: section ? section : undefined,
                yearOfAdmission: yearOfAdmission
                    ? yearOfAdmission
                    : undefined,
            },
        });
        if (!response.length)
            return res.status(404).json({
                err: "no such class!",
            });
        return res.status(200).json(response);
    }
    catch (e) {
        return res.status(500).json({
            err: "error: " + e.message,
        });
    }
});
exports.getAllClasses = getAllClasses;
const addNewClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { branchId, semester, section, yearOfAdmission } = req.body;
    const { userRole } = req;
    if (userRole !== "admin")
        return res.status(403).json({
            err: "only admin access!",
        });
    try {
        yield db_1.default.class.create({
            data: {
                branchId,
                semester: ("a" + semester),
                section,
                yearOfAdmission,
            },
        });
        res.status(200).json({
            msg: "successfully added new class!",
        });
    }
    catch (e) {
        return res.status(500).json({
            err: "error: " + e.message,
        });
    }
});
exports.addNewClass = addNewClass;
const addStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userRole } = req;
    if (userRole === "student")
        return res.status(403).json({
            err: "not authorized!",
        });
    const { classId, studentId } = req.body;
    if (userRole === "teacher") {
        try {
            const CT = yield db_1.default.classTeacher.findFirst({
                where: { classId },
            });
            if (req.teacherId !== (CT === null || CT === void 0 ? void 0 : CT.teacherId))
                return res.status(403).json({
                    err: "you are not the class teacher!",
                });
        }
        catch (e) {
            return res.status(500).json({
                err: "error: " + e.message,
            });
        }
    }
    try {
        const exists = yield db_1.default.class.findFirst({
            where: { classId },
            select: { studentIds: true },
        });
        if (!exists)
            return res.status(400).json({
                err: "class does not exist!",
            });
        const prevStudents = exists.studentIds;
        prevStudents.forEach((elem) => {
            if (elem === studentId)
                throw new Error("student already added!");
        });
        const response = yield db_1.default.class.update({
            data: {
                studentIds: {
                    set: [...prevStudents, studentId],
                },
            },
            where: { classId },
        });
        return res.status(200).json(response);
    }
    catch (e) {
        return res.status(500).json({
            err: "error: " + e.message,
        });
    }
});
exports.addStudent = addStudent;
