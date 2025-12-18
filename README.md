# Lumora

## Project Description

Lumora is a web platform for students and department administrators to manage academic activities, access course materials, and collaborate. The app supports department spaces with announcements, timetables, shared files, cohort quizzes, and voting/elections. Students can take quizzes, appear on leaderboards, access textbooks and course materials, connect and interact with other students in the same course, and use an AI assistant (powered by Google Gemini via an AI gateway) on each course detail page to help explain concepts. The platform also supports GPA/CGPA calculations for students. For urgent department-wide announcements the system can trigger phone calls via Twilio.

## Features

- Department dashboard: announcements, timetables, files integrated with ai, quizzes, voting/elections
- Course pages with textbook/material access and an AI assistant for explanations
- Cohort quizzes with result tracking and leaderboards
- GPA / CGPA calculation tools for students
- File uploads with AI-assisted chat/analysis of uploaded documents
- Social features: connect, message, and interact with classmates per course
- Urgent announcement phone call triggers using Twilio
- Supabase backend for auth, database and storage; edge functions for server-side tasks

## Installation & Run (Local)

Prerequisites:
- Node.js (recommended via nvm)
- npm or yarn

Steps:

```sh
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd learnwise-academics

# 2. Install dependencies
npm install
# or: yarn

# 3. Start development server
npm run dev
# open http://localhost:5173
```

Notes:
- The project uses Supabase for auth, database and storage. Configure environment variables (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) or a `.env` file as required by your environment.

## Tech Stack

- Vite
- React (TypeScript)
- Tailwind CSS
- shadcn-ui (Radix + Tailwind component library)
- Supabase (Auth, Database, Storage, Edge Functions)
- Framer Motion (animations)
- Lucide Icons
- Twilio (for urgent announcement phone calls)
- Google Gemini 2.5 Flash (via Lovable AI Gateway) – AI assistant & document analysis


## Team Members
- Elebiemayo Iseoluwa Emmanuel
- Ogunkoya Emmanuel Oluwakemi
- Nwokedi Ifechukwu Emmanuel

## Quick Usability

- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`
