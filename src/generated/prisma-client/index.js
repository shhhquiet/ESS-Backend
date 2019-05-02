"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "Gender",
    embedded: false
  },
  {
    name: "Role",
    embedded: false
  },
  {
    name: "SkillLevel",
    embedded: false
  },
  {
    name: "LessonType",
    embedded: false
  },
  {
    name: "Day",
    embedded: false
  },
  {
    name: "Color",
    embedded: false
  },
  {
    name: "Student",
    embedded: false
  },
  {
    name: "AccountAdmin",
    embedded: false
  },
  {
    name: "FrontDesk",
    embedded: false
  },
  {
    name: "Instructor",
    embedded: false
  },
  {
    name: "MedicalCondition",
    embedded: false
  },
  {
    name: "Class",
    embedded: false
  },
  {
    name: "Lesson",
    embedded: false
  },
  {
    name: "AgeGroup",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `${process.env["PRISMA_ENDPOINT"]}`,
  secret: `${process.env["PRISMA_SECRET"]}`
});
exports.prisma = new exports.Prisma();
