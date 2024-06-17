"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.uploadTeacherDetails = exports.updateInfo = exports.getAdminInfo = exports.signin = exports.signup = exports.upload = void 0;
const zod_1 = require("../../zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../../utils/db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = __importDefault(require("multer"));
const xlsx = __importStar(require("xlsx"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now() + file.originalname}`);
    },
});
exports.upload = (0, multer_1.default)({ storage });
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
        const exists = yield db_1.default.admin.findUnique({
            where: { email },
        });
        if (exists)
            return res.status(400).json({
                err: "user already exists!",
            });
        const result = yield db_1.default.admin.create({
            data: {
                name,
                employeeId,
                email,
                password: hashedPassword,
                joiningDate: yoj || new Date(),
            },
        });
        if (!result) {
            return res.status(401).json({
                err: "couldnt add to the database",
            });
        }
        return res.status(200).json({ msg: "Success!" });
    }
    catch (err) {
        return res.status(500).json({
            err: "internal server error: " + err.message,
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
        const exists = yield db_1.default.admin.findUnique({
            where: {
                email,
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
        const adminId = exists.adminId;
        const userRole = "admin";
        const token = jsonwebtoken_1.default.sign({ adminId, userRole }, process.env.JWT_SECRET, { expiresIn: "1h" });
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
const getAdminInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userRole } = req;
    const { employeeId } = req.params;
    console.log(req);
    if (!employeeId)
        return res.status(400).json({
            err: "no admin id found!",
        });
    if (!userRole || userRole !== "admin" || req.adminId !== employeeId) {
        return res.status(403).json({
            err: "Either you are not admin, or not requesting your information!",
        });
    }
    try {
        const response = yield db_1.default.admin.findUnique({
            where: { adminId: employeeId },
        });
        return res.status(200).json(response);
    }
    catch (e) {
        return res.status(400).json({
            err: e.message,
        });
    }
});
exports.getAdminInfo = getAdminInfo;
const updateInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userRole } = req;
    const { adminId } = req.params;
    const { password, dateOfBirth, gender, address, phNo } = req.body;
    if (!adminId)
        return res.status(400).json({
            err: "no admin id found!",
        });
    if (!userRole || userRole !== "admin" || req.adminId !== adminId) {
        return res.status(403).json({
            err: "Either you are not admin, or not requesting your information!",
        });
    }
    let dob = undefined;
    try {
        if (dateOfBirth) {
            const l = dateOfBirth.split("-");
            if (l.length !== 3) {
                dob = new Date(Date.now());
            }
            else {
                const year = parseInt(l[2], 10);
                const month = parseInt(l[1], 10) - 1;
                const date = parseInt(l[0], 10) + 1;
                dob = new Date(year, month, date);
            }
        }
        else
            dob = undefined;
        if (dob) {
            const x = dob.toDateString().split(" ");
            const monthInd = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(x[1]) / 3 + 1;
            const parseDate = `${x[3]}-${(monthInd < 10 ? "0" : "") + monthInd}-${x[2]}`;
            const obj = zod_1.dateCheck.safeParse({
                date: parseDate,
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
        yield db_1.default.admin.update({
            data: {
                address,
                dateOfBirth: dob,
                gender,
                phNo,
            },
            where: { adminId },
        });
        if (password) {
            yield db_1.default.admin.update({
                data: { password: yield bcrypt_1.default.hash(password, 10) },
                where: { adminId },
            });
        }
        return res.status(200).json({
            msg: "successfully updated data!",
        });
    }
    catch (e) {
        return res.status(400).json({
            err: e.message,
        });
    }
});
exports.updateInfo = updateInfo;
const uploadTeacherDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const directoryPath = path.join(__dirname, "../../../uploads");
    const files = fs.readdirSync(directoryPath);
    const excelfile = files[0];
    const excelFilePath = path.join(directoryPath, excelfile);
    const workbook = xlsx.readFile(excelFilePath);
    const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    try {
        for (let details of worksheet) {
            const resp = yield db_1.default.teacher.findFirst({
                where: {
                    email: details.email,
                },
            });
            if (!resp) {
                const response = yield db_1.default.teacher.create({
                    data: {
                        name: details.name,
                        email: details.email,
                        password: details.password,
                        employeeId: details.employeeId,
                    },
                });
            }
        }
    }
    catch (err) {
        return res.status(400).json({
            err: "error while uploading " + err,
        });
    }
    for (const file of files) {
        fs.unlink(path.join(directoryPath, file), (err) => {
            if (err) {
                console.log("error while deleting");
            }
            else {
                console.log("deleted succesfully");
            }
        });
    }
    return res.json({ msg: worksheet });
});
exports.uploadTeacherDetails = uploadTeacherDetails;
