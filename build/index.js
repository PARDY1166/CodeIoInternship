"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("./api/routes/index");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const api = (0, express_1.default)();
api.use(express_1.default.json());
api.use(index_1.api);
const HOST = "localhost";
const PORT = 3000;
api.listen(PORT, () => console.log(`Server up and running on PORT ${PORT} & HOST ${HOST}`));
