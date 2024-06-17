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
exports.updateStudentDetails = exports.getSpecificStudentByUsn = exports.getSpecificStudent = exports.getAllStudents = exports.signin = exports.signup = void 0;
const db_1 = __importDefault(require("../../utils/db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("../../zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, usn, email, password, confirmPassword, admissionDate } = req.body;
    let yoj;
    try {
        const l = admissionDate.split("-");
        if (l.length !== 3) {
            yoj = new Date(Date.now());
        }
        else {
            const year = parseInt(l[2], 10);
            const month = parseInt(l[1], 10) - 1;
            const date = parseInt(l[0], 10) + 1;
            if (year < 1900)
                throw new Error("");
            yoj = new Date(year, month, date);
            if (yoj > new Date())
                throw new Error("");
        }
    }
    catch (e) {
        yoj = undefined;
    }
    try {
        if (!yoj)
            throw new Error("invalid admission date provided");
        const x = yoj.toDateString().split(" ");
        const monthInd = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(x[1]) / 3 + 1;
        const parseDate = `${x[3]}-${(monthInd < 10 ? "0" : "") + monthInd}-${x[2]}`;
        const obj = zod_1.signupSchemaStudent.safeParse({
            name,
            usn,
            password,
            email,
            confirmPassword,
            admissionDate: parseDate,
        });
        if (!obj.success) {
            return res.status(401).json({
                err: "zod schema err: " + JSON.stringify(obj.error.issues[0].message),
            });
        }
    }
    catch (e) {
        return res.status(500).json({
            err: "error: " + e.message,
        });
    }
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const exists = yield db_1.default.$queryRaw `SELECT "name" from student WHERE (usn = ${usn}) OR (email = ${email});`;
        if (exists.length)
            return res.status(400).json({
                err: "student already exists!",
            });
        const result = yield db_1.default.student.create({
            data: {
                name,
                usn,
                email,
                password: hashedPassword,
            },
        });
        if (!result) {
            return res.status(401).json({
                err: "couldnt add to the database",
            });
        }
        try {
            yield db_1.default.studentDetails.create({
                data: {
                    studentId: result.studentId,
                    admissionDate: yoj,
                },
            });
        }
        catch (err) {
            yield db_1.default.student.delete({
                where: { studentId: result.studentId },
            });
            return res.status(400).json({ err: "error adding data!" });
        }
        return res.status(200).json({ msg: "Success!" });
    }
    catch (err) {
        return res.status(500).json({
            err: "internal server error" + err.message,
        });
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { usn, password } = req.body;
    try {
        const { success } = zod_1.signInSchemaStudent.safeParse({ usn, password });
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
        const exists = yield db_1.default.student.findFirst({
            where: {
                usn,
            },
        });
        if (!exists) {
            return res.status(404).json({
                err: "no user exists",
            });
        }
        const result = yield bcrypt_1.default.compare(password, exists.password);
        if (!result) {
            return res.status(403).json({
                err: "invalid credentials",
            });
        }
        const studentId = exists.studentId;
        const userRole = "student";
        const token = jsonwebtoken_1.default.sign({ studentId, userRole }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(200).json({
            message: `Bearer ${token}`,
        });
    }
    catch (err) {
        return res.json({
            err: "internal server error",
        });
    }
});
exports.signin = signin;
const getAllStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userRole } = req;
    if (!userRole || userRole === "student")
        return res.status(403).json({ err: "not authorized!" });
    let studs;
    try {
        if (userRole === "teacher") {
            studs = yield db_1.default.student.findMany({
                select: {
                    name: true,
                    email: true,
                    usn: true,
                },
            });
        }
        else {
            studs = yield db_1.default.student.findMany({
                include: {
                    studentDetails: true,
                }
            });
            if (!studs.length)
                return res.status(404).json({
                    err: "no students found!",
                });
        }
        return res.status(200).json(studs);
    }
    catch (e) {
        return res.status(400).json({
            err: "error occured: " + e.message,
        });
    }
});
exports.getAllStudents = getAllStudents;
const getSpecificStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.params;
    const { userRole } = req;
    if (!userRole || (userRole === "student" && studentId !== req.studentId))
        return res.status(403).json({
            err: "you are neither admin nor requesting your information",
        });
    let studs;
    try {
        if (userRole === "teacher") {
            studs = yield db_1.default.student.findUnique({
                select: {
                    name: true,
                    email: true,
                    usn: true,
                },
                where: {
                    studentId,
                },
            });
        }
        else {
            studs = yield db_1.default.student.findUnique({
                include: {
                    studentDetails: true,
                },
                where: {
                    studentId,
                },
            });
            if (!studs)
                return res.status(404).json({
                    err: "student not found!",
                });
        }
        return res.status(200).json(studs);
    }
    catch (e) {
        return res.status(400).json({
            err: "error occured: " + e.message,
        });
    }
});
exports.getSpecificStudent = getSpecificStudent;
const getSpecificStudentByUsn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { usn } = req.params;
    const { userRole } = req;
    try {
        const exists = yield db_1.default.student.findUnique({
            where: { usn },
        });
        if (!exists)
            return res.status(404).json({
                err: "student not found!",
            });
        if (!userRole ||
            (userRole === "student" && (exists === null || exists === void 0 ? void 0 : exists.studentId) !== req.studentId))
            return res.status(403).json({
                err: "you are neither admin nor requesting your information",
            });
    }
    catch (e) {
        return res.status(500).json({
            err: "error: " + e.message,
        });
    }
    let studs;
    try {
        if (userRole === "teacher") {
            studs = yield db_1.default.student.findUnique({
                select: {
                    name: true,
                    email: true,
                    usn: true,
                },
                where: {
                    usn,
                },
            });
        }
        else {
            studs = yield db_1.default.student.findUnique({
                include: {
                    studentDetails: true,
                },
                where: {
                    usn,
                },
            });
            if (!studs)
                return res.status(402).json({
                    err: "student not found!",
                });
        }
        return res.status(200).json(studs);
    }
    catch (e) {
        return res.status(400).json({
            err: "error occured: " + e.message,
        });
    }
});
exports.getSpecificStudentByUsn = getSpecificStudentByUsn;
const updateStudentDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.params;
    const { password, dateOfBirth, gender, address, phNo } = req.body;
    if (password) {
        try {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            yield db_1.default.student.update({
                data: {
                    password: hashedPassword,
                },
                where: { studentId },
            });
        }
        catch (e) {
            console.log("error updatinng password!");
        }
    }
    try {
        let dob = undefined;
        if (dateOfBirth) {
            const l = dateOfBirth.split("-");
            if (l.length === 3) {
                const year = parseInt(l[2], 10);
                const month = parseInt(l[1], 10) - 1;
                const date = parseInt(l[0], 10) + 1;
                dob = new Date(year, month, date);
            }
            else
                dob = undefined;
            if (dob) {
                const x = dob.toDateString().split(" ");
                const monthInd = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(x[1]) / 3 + 1;
                const parseDate = `${x[3]}-${(monthInd < 10 ? "0" : "") + monthInd}-${x[2]}`;
                if (!zod_1.dateCheck.safeParse({
                    date: parseDate,
                }).success)
                    throw new Error("invalid date of birth provided!");
            }
        }
        yield db_1.default.studentDetails.update({
            data: {
                gender,
                address,
                phNo,
                dateOfBirth: dob,
            },
            where: { studentId },
        });
        return res.status(200).json({
            msg: "success!",
        });
    }
    catch (e) {
        return res.status(400).json({
            err: "error updating profile! " + e.message,
        });
    }
});
exports.updateStudentDetails = updateStudentDetails;
