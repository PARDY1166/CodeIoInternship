
import zod from "zod";

const signupSchema = zod.object({
    name : zod.string(),
    usn : zod.string(),
    email:zod.string(),
    password:zod.string()
});

const signInSchema = zod.object({
    usn : zod.string(),
    password:zod.string()
});

export {signInSchema,signupSchema}