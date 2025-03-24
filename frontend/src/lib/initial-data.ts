import { Category } from "@/types";

export const initialCategories: Category[] = [
  {
    id: "health",
    name: "Health",
    type: "personal",
    description: "Physical and mental well-being management",
    roles: [
      {
        id: "health-1",
        categoryId: "health",
        name: "Fitness Enthusiast",
        purpose: "Maintain optimal physical health through regular exercise",
        coreQualities: ["Disciplined", "Energetic", "Consistent"],
        identityStatement: "I am committed to maintaining a healthy and active lifestyle",
        reflection: "Regular exercise helps me stay energized and focused",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "career",
    name: "Career Development",
    type: "professional",
    description: "Professional growth and career advancement",
    roles: [
      {
        id: "career-1",
        categoryId: "career",
        name: "Tech Leader",
        purpose: "Guide and mentor teams while staying technically proficient",
        coreQualities: ["Strategic", "Innovative", "Mentoring"],
        identityStatement: "I am a leader who empowers others through technology",
        reflection: "Technology leadership requires continuous learning",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];