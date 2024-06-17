"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateCheck = exports.signInSchemaTeacher = exports.signInSchemaStudent = exports.signupSchemaTeacher = exports.signupSchemaStudent = void 0;
const zod_1 = __importDefault(require("zod"));
exports.signupSchemaStudent = zod_1.default
    .object({
    name: zod_1.default
        .string()
        .min(2, "Minimum length of 2 needed")
        .max(30, "Maximum length can be 30"),
    usn: zod_1.default.string().length(10, "USN has to be of length 10"),
    email: zod_1.default.string().email(),
    password: zod_1.default
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be less than 32 characters"),
    confirmPassword: zod_1.default.string(),
    admissionDate: zod_1.default.string().date()
})
    .superRefine(({ confirmPassword, password }, context) => {
    if (confirmPassword !== password) {
        context.addIssue({
            code: "custom",
            message: "Passwords do not match",
            path: ["confirmPassword"],
        });
    }
    const isUpper = (ch) => /[A-Z]/.test(ch);
    const isLower = (ch) => /[a-z]/.test(ch);
    const isSpecial = (ch) => /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
    let cntUpper = 0, cntLower = 0, cntSpec = 0, cntNum = 0;
    for (let i = 0; i < password.length; i++) {
        let c = password[i];
        if (!isNaN(+c))
            cntNum++;
        else if (isUpper(c))
            cntUpper++;
        else if (isLower(c))
            cntLower++;
        else if (isSpecial(c))
            cntSpec++;
    }
    if (!(cntUpper && cntLower && cntNum && cntSpec)) {
        context.addIssue({
            code: "custom",
            message: "Password must contain aleast 1 upper-case, 1 lower-case, 1 number and 1 special charater!",
            path: ["confirmPassword"],
        });
    }
});
exports.signupSchemaTeacher = zod_1.default
    .object({
    name: zod_1.default
        .string()
        .min(2, "Minimum length of 2 needed")
        .max(30, "Maximum length can be 30"),
    employeeId: zod_1.default.string().length(10, "Employee ID has to be of length 10"),
    email: zod_1.default.string().email(),
    password: zod_1.default
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be less than 32 characters"),
    confirmPassword: zod_1.default.string(),
    joiningDate: zod_1.default.string().date()
})
    .superRefine(({ confirmPassword, password }, context) => {
    if (confirmPassword !== password) {
        context.addIssue({
            code: "custom",
            message: "Passwords do not match",
            path: ["confirmPassword"],
        });
    }
    const isUpper = (ch) => /[A-Z]/.test(ch);
    const isLower = (ch) => /[a-z]/.test(ch);
    const isSpecial = (ch) => /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
    let cntUpper = 0, cntLower = 0, cntSpec = 0, cntNum = 0;
    for (let i = 0; i < password.length; i++) {
        let c = password[i];
        if (!isNaN(+c))
            cntNum++;
        else if (isUpper(c))
            cntUpper++;
        else if (isLower(c))
            cntLower++;
        else if (isSpecial(c))
            cntSpec++;
    }
    if (!(cntUpper && cntLower && cntNum && cntSpec)) {
        context.addIssue({
            code: "custom",
            message: "Password must contain aleast 1 upper-case, 1 lower-case, 1 number and 1 special charater!",
            path: ["confirmPassword"],
        });
    }
});
exports.signInSchemaStudent = zod_1.default.object({
    usn: zod_1.default.string().length(10, "USN has to be of length 10"),
    password: zod_1.default
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be less than 32 characters"),
});
exports.signInSchemaTeacher = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be less than 32 characters"),
});
exports.dateCheck = zod_1.default.object({
    date: zod_1.default.string().date()
});
