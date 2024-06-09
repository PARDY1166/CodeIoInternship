import z from "zod";

export const signupSchemaStudent = z
  .object({
    name: z
      .string()
      .min(2, "Minimum length of 2 needed")
      .max(30, "Maximum length can be 30"),
    usn: z.string().length(10, "USN has to be of length 10"),
    email: z.string().email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password must be less than 32 characters"),
    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, context) => {
    if (confirmPassword !== password) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }

    const isUpper = (ch: string) => /[A-Z]/.test(ch);
    const isLower = (ch: string) => /[a-z]/.test(ch);
    const isSpecial = (ch: string) =>
      /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);

    let cntUpper = 0,
      cntLower = 0,
      cntSpec = 0,
      cntNum = 0;
    for (let i = 0; i < password.length; i++) {
      let c = password[i];
      if (!isNaN(+c)) cntNum++;
      else if (isUpper(c)) cntUpper++;
      else if (isLower(c)) cntLower++;
      else if (isSpecial(c)) cntSpec++;
    }

    if (!(cntUpper && cntLower && cntNum && cntSpec)) {
      context.addIssue({
        code: "custom",
        message:
          "Password must contain aleast 1 upper-case, 1 lower-case, 1 number and 1 special charater!",
        path: ["confirmPassword"],
      });
    }
  });

export const signupSchemaTeacher = z
  .object({
    name: z
      .string()
      .min(2, "Minimum length of 2 needed")
      .max(30, "Maximum length can be 30"),
    employeeid: z.string().length(10, "Employee ID has to be of length 10"),
    email: z.string().email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password must be less than 32 characters"),
    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, context) => {
    if (confirmPassword !== password) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }

    const isUpper = (ch: string) => /[A-Z]/.test(ch);
    const isLower = (ch: string) => /[a-z]/.test(ch);
    const isSpecial = (ch: string) =>
      /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);

    let cntUpper = 0,
      cntLower = 0,
      cntSpec = 0,
      cntNum = 0;
    for (let i = 0; i < password.length; i++) {
      let c = password[i];
      if (!isNaN(+c)) cntNum++;
      else if (isUpper(c)) cntUpper++;
      else if (isLower(c)) cntLower++;
      else if (isSpecial(c)) cntSpec++;
    }

    if (!(cntUpper && cntLower && cntNum && cntSpec)) {
      context.addIssue({
        code: "custom",
        message:
          "Password must contain aleast 1 upper-case, 1 lower-case, 1 number and 1 special charater!",
        path: ["confirmPassword"],
      });
    }
  });

export const signInSchemaStudent = z.object({
  usn: z.string().length(10, "USN has to be of length 10"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters"),
});


export const signInSchemaTeacher = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters"),
});