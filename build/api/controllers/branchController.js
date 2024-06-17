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
exports.deleteBranch = exports.getAllBranches = exports.updateBranch = exports.addNewBranch = void 0;
const db_1 = __importDefault(require("../../utils/db"));
const addNewBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userRole } = req;
    if (userRole !== "admin")
        return res.status(403).json({
            err: "only admin can add new branch!",
        });
    const { branchName, branchCode } = req.body;
    try {
        const exists = yield db_1.default.$queryRaw `SELECT "branchId" FROM branch WHERE ("branchName" = ${branchName}) OR ("branchCode" = ${branchCode})`;
        console.log("Exists!: ", exists);
        if (exists.length)
            return res.status(400).json({
                err: "branch already exists!",
            });
        yield db_1.default.branch.create({
            data: { branchName, branchCode },
        });
        return res.status(200).json({
            msg: "Success!",
        });
    }
    catch (e) {
        return res.status(400).json({
            err: e.message,
        });
    }
});
exports.addNewBranch = addNewBranch;
const updateBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userRole } = req;
    if (userRole !== "admin")
        return res.status(403).json({
            err: "only admin can add new branch!",
        });
    const { branchName, branchCode, branchId } = req.body;
    try {
        yield db_1.default.branch.update({
            where: { branchId },
            data: { branchCode, branchName },
        });
        return res.status(200).json({
            msg: "Success",
        });
    }
    catch (e) {
        return res.status(400).json({
            err: e.message,
        });
    }
});
exports.updateBranch = updateBranch;
const getAllBranches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.userRole === "student")
        return res.status(403).json({
            err: "students can't access this!",
        });
    try {
        const response = yield db_1.default.branch.findMany();
        return res.status(200).json(response);
    }
    catch (e) {
        return res.status(400).json({
            err: e.message,
        });
    }
});
exports.getAllBranches = getAllBranches;
const deleteBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userRole } = req;
    const { branchId } = req.body;
    if (userRole !== "admin")
        res.status(403).json({
            err: "only admins can delete a branch",
        });
    try {
        yield db_1.default.branch.delete({
            where: {
                branchId,
            },
        });
        return res.status(200).json({ msg: "successfully deleted branch!" });
    }
    catch (e) {
        return res.status(400).json({
            err: e.message,
        });
    }
});
exports.deleteBranch = deleteBranch;
