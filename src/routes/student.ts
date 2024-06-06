import {signin,signup} from "../controllers/studentController"

const express = require('express');
const router = express.Router();

router.post('/signin',signin);
router.post('/signup',signup);

export {router}