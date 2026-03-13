// ─── model/constants.js ───────────────────────────────────────────────────────
// All static data, enumerations, and configuration live here.

export const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Geography",
  "Computer Science",
];

export const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export const TOPICS = {
  Mathematics: [
    "Algebra",
    "Fractions",
    "Geometry",
    "Statistics",
    "Calculus",
    "Number Theory",
  ],
  Science: [
    "Physics",
    "Chemistry",
    "Biology",
    "Ecology",
    "Astronomy",
    "Earth Science",
  ],
  English: [
    "Grammar",
    "Comprehension",
    "Vocabulary",
    "Essay Writing",
    "Poetry",
    "Literature",
  ],
  History: [
    "Ancient History",
    "World Wars",
    "Indian History",
    "Renaissance",
    "Cold War",
    "Civilisations",
  ],
  Geography: [
    "Maps & Directions",
    "Climate",
    "Countries & Capitals",
    "Physical Geography",
    "Population",
    "Resources",
  ],
  "Computer Science": [
    "Algorithms",
    "Data Structures",
    "Networking",
    "Databases",
    "Programming",
    "Cybersecurity",
  ],
};

export const QUIZ_LENGTHS = [3, 5, 8, 10];
export const TIME_PER_Q_MIN = 10;
export const TIME_PER_Q_MAX = 90;
export const TIME_PER_Q_STEP = 5;
export const ADAPTIVE_STREAK_THRESHOLD = 3; // correct answers in a row to bump difficulty

export const SAMPLE_STUDENTS = [
  {
    id: 1,
    name: "Aryan Mehta",
    grade: "10A",
    quizzes: 24,
    avg: 78,
    trend: +6,
    weakTopics: ["Fractions", "Grammar"],
  },
  {
    id: 2,
    name: "Priya Sharma",
    grade: "10A",
    quizzes: 31,
    avg: 91,
    trend: +3,
    weakTopics: ["Calculus"],
  },
  {
    id: 3,
    name: "Rohan Das",
    grade: "10B",
    quizzes: 12,
    avg: 54,
    trend: -4,
    weakTopics: ["Algebra", "Physics", "Grammar"],
  },
  {
    id: 4,
    name: "Sneha Patel",
    grade: "10B",
    quizzes: 28,
    avg: 83,
    trend: +9,
    weakTopics: ["Statistics"],
  },
  {
    id: 5,
    name: "Karan Singh",
    grade: "10A",
    quizzes: 7,
    avg: 61,
    trend: -2,
    weakTopics: ["Chemistry", "Fractions"],
  },
];

export const WEAKNESS_HEATMAP_TOPICS = [
  "Algebra",
  "Fractions",
  "Grammar",
  "Chemistry",
  "Calculus",
  "Statistics",
];

export const ROLES = { STUDENT: "student", TEACHER: "teacher" };

export const PAGES = {
  HOME: "home",
  QUIZ: "quiz",
  ANALYTICS: "analytics",
  REPORTS: "reports",
};

export const CLAUDE_MODEL = "claude-sonnet-4-20250514";
export const CLAUDE_MAX_TOKENS = 1200;