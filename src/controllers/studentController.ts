import { Request, Response } from "express";
import prisma from "../utils/db";
import zod from "zod";

async function signup(req:Request,res:Response){
    const { name,usn,email,password } = req.body;
}

async function signin(req:any,res:any){
    const { usn,password } = req.body;

}



export {signin,signup}