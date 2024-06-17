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
exports.makeClassTeacher = exports.updateTeacherDetails = exports.getSpecificTeacher = exports.getAllTeachers = exports.signin = exports.signup = void 0;
const db_1 = __importDefault(require("../../utils/db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("../../zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, employeeId, email, password, confirmPassword, joiningDate } = req.body;
    let yoj;
    try {
        if (joiningDate) {
            const l = joiningDate.split("-");
            if (l.length !== 3) {
                yoj = new Date(Date.now());
            }
            else {
                const year = parseInt(l[2], 10);
                const month = parseInt(l[1], 10) - 1;
                const date = parseInt(l[0], 10) + 1;
                yoj = new Date(year, month, date);
            }
        }
        else
            yoj = new Date(Date.now());
        const x = yoj.toDateString().split(" ");
        const monthInd = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(x[1]) / 3 + 1;
        const parseDate = `${x[3]}-${(monthInd < 10 ? "0" : "") + monthInd}-${x[2]}`;
        console.log("date: ", parseDate);
        const obj = zod_1.signupSchemaTeacher.safeParse({
            name,
            employeeId,
            password,
            email,
            confirmPassword,
            joiningDate: parseDate,
        });
        if (!obj.success) {
            return res.status(401).json({
                err: "zod schema err: " +
                    JSON.stringify("code: " +
                        obj.error.issues[0].code +
                        "\nmsg: " +
                        obj.error.issues[0].message),
            });
        }
    }
    catch (e) {
        return res.status(500).json({
            err: "internal server error: " + e.message,
        });
    }
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const result = yield db_1.default.teacher.create({
            data: {
                name,
                employeeId,
                email,
                password: hashedPassword,
            },
        });
        yield db_1.default.teacherDetails.create({
            data: { joiningDate: yoj, teacherId: result.teacherId },
        });
        return res.status(200).json({
            msg: "Success",
        });
    }
    catch (err) {
        return res.status(500).json({
            err: "internal server error" + err.message,
        });
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const { success } = zod_1.signInSchemaTeacher.safeParse({ email, password });
        if (!success) {
            return res.status(401).json({
                err: "invalid data type",
            });
        }
    }
    catch (err) {
        return res.status(500).json({
            err: "internal server error",
        });
    }
    try {
        const exists = yield db_1.default.teacher.findFirst({
            where: {
                email,
            },
        });
        if (!exists) {
            return res.status(404).json({
                err: "no teacher exists",
            });
        }
        const result = yield bcrypt_1.default.compare(password, exists.password);
        if (!result) {
            return res.status(403).json({
                err: "invalid credentials",
            });
        }
        const teacherId = exists.teacherId;
        const userRole = "teacher";
        const token = jsonwebtoken_1.default.sign({ teacherId, userRole }, process.env.JWT_SECRET);
        return res.status(200).json({
            message: `bearer ${token}`,
        });
    }
    catch (err) {
        return res.json({
            err: "internal server error",
        });
    }
});
exports.signin = signin;
const getAllTeachers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userRole } = req;
    if (!userRole || userRole !== "admin")
        return res.status(400).json({
            err: "only admin access!",
        });
    try {
        const result = yield db_1.default.teacher.findMany({
            include: {
                teacherDetails: true,
            },
        });
        console.log(result);
        if (!result.length)
            return res.status(404).json({
                err: "No users found!",
            });
        res.status(200).json(result);
    }
    catch (e) {
        return res.status(400).json({
            err: "Error: " + e.message,
        });
    }
});
exports.getAllTeachers = getAllTeachers;
const getSpecificTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userRole } = req;
    const { teacherId } = req.params;
    if (userRole !== "admin" && teacherId != req.teacherId)
        return res.status(403).json({
            err: "neither are you admin, nor requesting for your own info",
        });
    try {
        const result = yield db_1.default.teacher.findMany({
            include: {
                teacherDetails: true,
            },
        });
        if (!result.length)
            return res.status(404).json({
                err: "No user found!",
            });
        return res.status(200).json(result[0]);
    }
    catch (e) {
        res.status(400).json({
            err: "Error: " + e.message,
        });
    }
});
exports.getSpecificTeacher = getSpecificTeacher;
const updateTeacherDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teacherId } = req.params;
    const { password, dateOfBirth, gender, address, joiningDate, phNo } = req.body;
    const { userRole } = req;
    if (userRole !== "admin" && teacherId !== req.teacherId)
        return res.status(403).json({
            err: "neither are you the admin, nor are you requesting for your own information!",
        });
    if (password) {
        try {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            yield db_1.default.teacher.update({
                data: {
                    password: hashedPassword,
                },
                where: { teacherId },
            });
        }
        catch (e) {
            console.log("error updatinng password!");
        }
        try {
            const l = dateOfBirth.split("-");
            const m = joiningDate.split("-");
            let dob;
            let yoj;
            if (l.length === 3) {
                const year = parseInt(l[2], 10);
                const month = parseInt(l[1], 10) - 1;
                const date = parseInt(l[0], 10) + 1;
                dob = new Date(year, month, date);
            }
            else
                dob = undefined;
            if (m.length === 3) {
                const year = parseInt(l[2], 10);
                const month = parseInt(l[1], 10) - 1;
                const date = parseInt(l[0], 10) + 1;
                yoj = new Date(year, month, date);
            }
            else
                yoj = undefined;
            yield db_1.default.teacherDetails.update({
                data: {
                    gender,
                    address,
                    phNo,
                    dateOfBirth: dob,
                    joiningDate: yoj,
                },
                where: { teacherId },
            });
        }
        catch (e) {
            return res.status(400).json({
                err: "error updating profile!",
            });
        }
    }
});
exports.updateTeacherDetails = updateTeacherDetails;
const makeClassTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userRole } = req;
    if (userRole !== "admin")
        return res.status(403).json({
            err: "not authorized for this action!",
        });
    const { classId } = req.body;
    const { teacherId } = req.params;
    try {
        yield db_1.default.classTeacher.create({
            data: {
                teacherId,
                classId,
            },
        });
        return res.status(200).json({
            msg: "success!",
        });
    }
    catch (e) {
        return res.status(500).json({
            err: "error: " + e.message,
        });
    }
});
exports.makeClassTeacher = makeClassTeacher;
