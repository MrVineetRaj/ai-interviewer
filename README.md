# 🚀 AI Interviewer

> An AI-powered interview simulator that provides the brutally honest, uncensored feedback you need to ace your technical interviews.

## ✨ Features

- **Realistic AI Interviewer:** Engage in dynamic conversations with an AI that asks tough questions about Data Structures, System Design, and your resume, adapting in real-time to your responses.
- **Dual-Action Feedback:** Receive two detailed reports after each session: a harsh critique of your interview performance and an actionable plan to optimize your resume for that specific job.
- **Voice-Enabled Simulation:** Practice your verbal communication with integrated Speech-to-Text and Text-to-Speech for a true-to-life remote interview experience.
- **Zero-Config Setup:** Fully containerized with Docker. Go from `git clone` to a running application in a single command.

## 🛠️ Tech Stack

- **Frontend:** Next.js, Shadcn, Tailwind CSS
- **Database:** PostgreSQL,
- **AI:** OpenAI API
- **Containerization:** Docker & Docker Compose

## Prerequisites

Before you begin, ensure you have the following installed on your system. This project is designed to have minimal dependencies.

- [**Docker**](https://docs.docker.com/get-docker/)
- [**Docker Compose**](https://docs.docker.com/compose/install/)

## 🚀 Getting Started in 60 Seconds

This entire application is containerized, so getting it running is as simple as it gets.

### 1\. Clone the Repository

```bash
git clone https://github.com/MrVineetRaj/ai-interviewer.git
cd yai-interviewer
```

### 2\. Configure Docker Compose file

just add your openai key to [docker-compose.yml](./docker-compose.yml) file

### 3\. Run with Docker Compose

This single command will build the necessary Docker images, create the containers, and run the entire application in the background.

```bash
docker-compose up -d
```

That's it\! The application should now be running.

- 🌐 **available at:** `http://localhost:3000`

### 4\. Stop the Application

When you're finished, you can stop all the running containers with a single command. This will also remove the containers and networks created by Docker Compose.

```bash
docker-compose down
```
