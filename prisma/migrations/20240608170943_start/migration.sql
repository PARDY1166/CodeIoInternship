-- CreateEnum
CREATE TYPE "genderenum" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "semesterenum" AS ENUM ('a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8');

-- CreateTable
CREATE TABLE "branch" (
    "branchId" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,

    CONSTRAINT "branch_pkey" PRIMARY KEY ("branchId")
);

-- CreateTable
CREATE TABLE "course" (
    "courseId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,

    CONSTRAINT "course_pkey" PRIMARY KEY ("courseId")
);

-- CreateTable
CREATE TABLE "courseUndertaken" (
    "courseObjId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" "semesterenum" NOT NULL,
    "section" CHAR(1) NOT NULL,

    CONSTRAINT "courseUndertaken_pkey" PRIMARY KEY ("courseObjId")
);

-- CreateTable
CREATE TABLE "student" (
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "usn" VARCHAR(10) NOT NULL,
    "password" TEXT,

    CONSTRAINT "student_pkey" PRIMARY KEY ("studentId")
);

-- CreateTable
CREATE TABLE "studentDetails" (
    "studentId" TEXT NOT NULL,
    "age" TEXT,
    "gender" "genderenum",
    "address" TEXT,
    "yearOfAdmission" INTEGER,
    "phNo" VARCHAR(10),

    CONSTRAINT "studentDetails_pkey" PRIMARY KEY ("studentId")
);

-- CreateTable
CREATE TABLE "teacher" (
    "teacherId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "password" TEXT,

    CONSTRAINT "teacher_pkey" PRIMARY KEY ("teacherId")
);

-- CreateTable
CREATE TABLE "teacherDetails" (
    "teacherId" TEXT NOT NULL,
    "age" TEXT,
    "gender" "genderenum",
    "address" TEXT,
    "yearOfJoining" INTEGER NOT NULL,
    "phNo" VARCHAR(10),

    CONSTRAINT "teacherDetails_pkey" PRIMARY KEY ("teacherId")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_email_key" ON "student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_usn_key" ON "student"("usn");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_email_key" ON "teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_employeeId_key" ON "teacher"("employeeId");

-- AddForeignKey
ALTER TABLE "courseUndertaken" ADD CONSTRAINT "fk_branchid" FOREIGN KEY ("branchId") REFERENCES "branch"("branchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseUndertaken" ADD CONSTRAINT "fk_courseid" FOREIGN KEY ("courseId") REFERENCES "course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseUndertaken" ADD CONSTRAINT "fk_teacherid" FOREIGN KEY ("teacherId") REFERENCES "teacher"("teacherId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studentDetails" ADD CONSTRAINT "fk_studentid" FOREIGN KEY ("studentId") REFERENCES "student"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacherDetails" ADD CONSTRAINT "fk_teacherid" FOREIGN KEY ("teacherId") REFERENCES "teacher"("teacherId") ON DELETE CASCADE ON UPDATE CASCADE;
