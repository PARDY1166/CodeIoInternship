import { Request, Response } from "express";
import prisma from "../utils/db";
import zod from "zod";
import jwt from "jsonwebtoken";
import { signInSchema,signupSchema } from "../zod";


async function signup(req:Request,res:Response){
    const { name,usn,email,password } = req.body;

    

    try{
        const {success} = signupSchema.safeParse({name,usn,password,email});
        if(!success){
            return res.status(401).json({
                err : "invalid data type"
            })
        }
    }catch(err){
        return res.status(500).json({
            err : "internal server error"
        })
    }

    try{
        const result = await prisma.student.create({
            data : {
                name,
                usn,
                email,
                password
            }
        });
        if(!result){
            return res.status(401).json(
                {
                    err : "couldnt add to the database"
                }
            )
        }
        console.log(result);
    }catch(err){
        return res.status(500).json(
            {
                err : "internal server error"+err
            }
        )
    }

    
}

async function signin(req:any,res:any){
    const { usn,password } = req.body;

    try{
        const {success} = signInSchema.safeParse({usn,password});
        if(!success){
            return res.status(401).json({
                err : "invalid data type"
            })
        }
    }catch(err){
        return res.status(500).json({
            err : "internal server error"
        })
    }

    try{
        const result = await prisma.student.findFirst({
            where : {
                usn,
                password
            }
        });

        if(!result){
            return res.status(404).json(
                {
                    err : "couldnt find user"
                }
            )
        }

        const studentId = result.studentid;
        const token = jwt.sign({studentId},process.env.JWT_SECRET as string);
        return res.status(200).json({
            message : `bearer ${token}`
        })
    }catch(err){
        return res.json({
            err : "internal server error"
        })
    }
}



export {signin,signup}