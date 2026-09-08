const express = require("express");
const cors = require("cors");

require("dotenv").config();

const axios = require("axios");

const { Pool } = require("pg");

const app = express();


const PORT = 5000;


// This allows our server to understand JSON data
app.use(cors());

app.use(express.json());
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "ai_study_planner",
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});
pool.query("SELECT NOW()", (error, result) => {

  if (error) {

    console.log("Database connection failed:");
    console.log(error.message);

  } else {

    console.log("Database connected successfully!");

  }

});



// Home route
app.get("/", (req, res) => {

  res.send("AI Study Planner Backend is running!");

});


// GET all subjects
app.get("/api/subjects", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM subjects ORDER BY id"
    );

    res.json(result.rows);

  } catch (error) {

    console.log("Error getting subjects:", error.message);

    res.status(500).json({
      error: "Failed to get subjects"
    });

  }

});
// Add a new subject
app.post("/api/subjects", async (req, res) => {

  const { name, examDate, confidence } = req.body;

  try {

    const result = await pool.query(
      `INSERT INTO subjects (name, exam_date, confidence)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, examDate || null, confidence]
    );

    const newSubject = result.rows[0];

    res.status(201).json(newSubject);

  } catch (error) {

    console.log("Error adding subject:", error.message);

    res.status(500).json({
      error: "Failed to add subject"
    });

  }

});

// Delete a subject
app.delete("/api/subjects/:id", async (req, res) => {

  const { id } = req.params;

  try {

    const result = await pool.query(
      "DELETE FROM subjects WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: "Subject not found"
      });

    }
   
    res.json({
      message: "Subject deleted successfully",
      subject: result.rows[0]
    });

  } catch (error) {

    console.log("Error deleting subject:", error.message);

    res.status(500).json({
      error: "Failed to delete subject"
    });

  }

});
// Update a subject
app.put("/api/subjects/:id", async (req, res) => {

  const { id } = req.params;
  const { name, examDate, confidence } = req.body;

  try {

    const result = await pool.query(
      `UPDATE subjects
       SET name = $1,
           exam_date = $2,
           confidence = $3
       WHERE id = $4
       RETURNING *`,
      [name, examDate || null, confidence, id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: "Subject not found"
      });

    }

    res.json(result.rows[0]);

  } catch (error) {

    console.log("Error updating subject:", error.message);

    res.status(500).json({
      error: "Failed to update subject"
    });

  }

});

// Get topics for a subject
app.get("/api/subjects/:subjectId/topics", async (req, res) => {

  const { subjectId } = req.params;

  try {

    const result = await pool.query(
      `SELECT * FROM topics
       WHERE subject_id = $1
       ORDER BY id`,
      [subjectId]
    );

    res.json(result.rows);

  } catch (error) {

    console.log("Error getting topics:", error.message);

    res.status(500).json({
      error: "Failed to get topics"
    });

  }

});

// Add a topic
app.post("/api/subjects/:subjectId/topics", async (req, res) => {

  const { subjectId } = req.params;
  const { name } = req.body;

  try {

    const result = await pool.query(
      `INSERT INTO topics (subject_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [subjectId, name]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

    console.log("Error adding topic:", error.message);

    res.status(500).json({
      error: "Failed to add topic"
    });

  }

});

// Delete a topic
app.delete("/api/topics/:id", async (req, res) => {

  const { id } = req.params;

  try {

    const result = await pool.query(
      "DELETE FROM topics WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: "Topic not found"
      });

    }

    res.json({
      message: "Topic deleted successfully"
    });

  } catch (error) {

    console.log("Error deleting topic:", error.message);

    res.status(500).json({
      error: "Failed to delete topic"
    });

  }

});

// Mark a topic as completed/uncompleted
app.put("/api/topics/:id", async (req, res) => {

  const { id } = req.params;
  const { completed } = req.body;

  try {

    const result = await pool.query(
      `UPDATE topics
       SET completed = $1
       WHERE id = $2
       RETURNING *`,
      [completed, id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: "Topic not found"
      });

    }

    res.json(result.rows[0]);

  } catch (error) {

    console.log("Error updating topic:", error.message);

    res.status(500).json({
      error: "Failed to update topic"
    });

  }

});

app.get("/api/subjects/:subjectId/tasks", async (req, res) => {

  const { subjectId } = req.params;

  try {

    const result = await pool.query(
      `SELECT * FROM tasks
       WHERE subject_id = $1
       ORDER BY id`,
      [subjectId]
    );

    res.json(result.rows);

  } catch (error) {

    console.log("Error getting tasks:", error.message);

    res.status(500).json({
      error: "Failed to get tasks"
    });

  }

});

app.post("/api/subjects/:subjectId/tasks", async (req, res) => {

  const { subjectId } = req.params;
  const { topicId, title, duration } = req.body;

  try {

    const result = await pool.query(
      `INSERT INTO tasks
       (subject_id, topic_id, title, duration)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [subjectId, topicId || null, title, duration || 30]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

    console.log("Error adding task:", error.message);

    res.status(500).json({
      error: "Failed to add task"
    });

  }

});

app.put("/api/tasks/:id", async (req, res) => {

  const { id } = req.params;
  const { completed } = req.body;

  try {

    const result = await pool.query(
      `UPDATE tasks
       SET completed = $1
       WHERE id = $2
       RETURNING *`,
      [completed, id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: "Task not found"
      });

    }

    res.json(result.rows[0]);

  } catch (error) {

    console.log("Error updating task:", error.message);

    res.status(500).json({
      error: "Failed to update task"
    });

  }

});

app.delete("/api/tasks/:id", async (req, res) => {

  const { id } = req.params;

  try {

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: "Task not found"
      });

    }

    res.json({
      message: "Task deleted successfully"
    });

  } catch (error) {

    console.log("Error deleting task:", error.message);

    res.status(500).json({
      error: "Failed to delete task"
    });

  }

});

app.get("/api/tasks", async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT
        tasks.*,
        subjects.name AS subject_name,
        topics.name AS topic_name
       FROM tasks
       JOIN subjects
         ON tasks.subject_id = subjects.id
       LEFT JOIN topics
         ON tasks.topic_id = topics.id
       ORDER BY tasks.completed, tasks.id`
    );

    res.json(result.rows);

  } catch (error) {

    console.log("Error getting all tasks:", error.message);

    res.status(500).json({
      error: "Failed to get tasks"
    });

  }

});



app.get("/api/study-priority", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        subjects.id,
        subjects.name,
        subjects.exam_date,
        subjects.confidence,

        COUNT(topics.id) AS total_topics,

        COUNT(
          CASE
            WHEN topics.completed = true
            THEN 1
          END
        ) AS completed_topics

      FROM subjects

      LEFT JOIN topics
        ON subjects.id = topics.subject_id

      GROUP BY
        subjects.id

      ORDER BY
        subjects.exam_date ASC
    `);


    const today = new Date();


    const priorities = result.rows.map(subject => {

      const examDate = new Date(subject.exam_date);

      const daysUntilExam =
        Math.ceil(
          (examDate - today) /
          (1000 * 60 * 60 * 24)
        );


      const totalTopics =
        Number(subject.total_topics);

      const completedTopics =
        Number(subject.completed_topics);


      const completionPercentage =
        totalTopics === 0
          ? 0
          : (completedTopics / totalTopics) * 100;


      const examScore =
        daysUntilExam <= 0
          ? 100
          : Math.max(
              0,
              100 - (daysUntilExam * 4)
            );


      const confidenceScore =
        100 - (Number(subject.confidence) * 10);


      const completionScore =
        100 - completionPercentage;


      const priorityScore =
        (
          examScore * 0.5
          +
          confidenceScore * 0.3
          +
          completionScore * 0.2
        );


      let priority = "Low";


      if (priorityScore >= 70) {
        priority = "High";
      } else if (priorityScore >= 40) {
        priority = "Medium";
      }


      return {

        id: subject.id,

        name: subject.name,

        examDate: subject.exam_date,

        confidence: Number(subject.confidence),

        totalTopics,

        completedTopics,

        completionPercentage:
          Math.round(completionPercentage),

        daysUntilExam,

        priorityScore:
          Math.round(priorityScore),

        priority

      };

    });


    priorities.sort(
      (a, b) =>
        b.priorityScore -
        a.priorityScore
    );


    res.json(priorities);


  } catch (error) {

    console.log(
      "Error calculating priorities:",
      error.message
    );


    res.status(500).json({

      error:
        "Failed to calculate study priorities"

    });

  }

});

app.get("/api/ai-recommendation", async (req, res) => {

  try {

    const subjects = await pool.query(`
      SELECT
        subjects.name,
        subjects.exam_date,
        subjects.confidence,
        COUNT(topics.id) AS total_topics,
        COUNT(
          CASE
            WHEN topics.completed = true
            THEN 1
          END
        ) AS completed_topics
      FROM subjects
      LEFT JOIN topics
        ON subjects.id = topics.subject_id
      GROUP BY subjects.id
      ORDER BY subjects.exam_date ASC
    `);


    const tasks = await pool.query(`
      SELECT
        title,
        duration,
        completed
      FROM tasks
      ORDER BY completed, id
    `);


    res.json({

      message: "AI recommendation data prepared.",

      subjects: subjects.rows,

      tasks: tasks.rows

    });


  } catch (error) {

    console.log(
      "AI recommendation error:",
      error.message
    );

    res.status(500).json({
      error: "Failed to prepare AI recommendation"
    });

  }

});

app.post("/api/ai-recommendation", async (req, res) => {

  try {

    const { subjects, tasks } = req.body;


    const prompt = `
You are an AI study planner helping a college student.

Analyze the student's subjects and study tasks.

Subjects:
${JSON.stringify(subjects, null, 2)}

Tasks:
${JSON.stringify(tasks, null, 2)}

Give the student a short, practical study recommendation.

Tell them:
1. Which subject they should study first.
2. Why they should prioritize it.
3. Which specific task they should work on.
4. Approximately how long they should study.

Do not invent subjects or tasks that are not provided.

Keep the recommendation under 150 words.
`;


    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",

      {
        model: "openrouter/free",

        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },

      {
        headers: {
          "Authorization":
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type":
            "application/json"
        }
      }
    );


    const recommendation =
      response.data.choices[0].message.content;


    res.json({
      recommendation: recommendation
    });


  } catch (error) {

    console.log(
      "AI error:",
      error.response?.data ||
      error.message
    );


    res.status(500).json({
      error:
        "AI recommendation failed"
    });

  }

});

app.post("/api/ai-chat", async (req, res) => {

  try {

    const {
      message,
      subjects,
      tasks,
      conversation
    } = req.body;


    const conversationText =
      conversation
        .map(item => {

          if (item.role === "user") {
            return `Student: ${item.text}`;
          }

          return `AI Assistant: ${item.text}`;

        })
        .join("\n");


    const prompt = `
You are the AI assistant inside a college student's study planner.

You have access to the student's current study data.

SUBJECTS:
${JSON.stringify(subjects, null, 2)}

TASKS:
${JSON.stringify(tasks, null, 2)}


PREVIOUS CONVERSATION:
${conversationText || "No previous conversation."}


LATEST STUDENT MESSAGE:
${message}


Answer the student's latest message.

Use the previous conversation to understand references
such as "that", "it", "tomorrow", "the next one", etc.

Use the student's actual subjects and tasks when relevant.

Do not invent subjects, topics, exams, or tasks.

Be practical, friendly, and concise.

If the student asks for a study plan,
give clear actionable steps.
`;


    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",

      {
        model: "openrouter/free",

        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },

      {
        headers: {
          "Authorization":
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type":
            "application/json"
        }
      }
    );


    const answer =
      response.data.choices[0].message.content;


    res.json({
      answer: answer
    });


  } catch (error) {

    console.log(
      "AI chat error:",
      error.response?.data ||
      error.message
    );


    res.status(500).json({
      error: "AI chat failed"
    });

  }

});

app.post("/api/ai-study-plan", async (req, res) => {

  try {

    const {
      subjects,
      tasks,
      availableMinutes
    } = req.body;


    const prompt = `
You are an AI study planner.

Create a realistic study plan for the student.

CURRENT SUBJECTS:
${JSON.stringify(subjects, null, 2)}

CURRENT TASKS:
${JSON.stringify(tasks, null, 2)}

AVAILABLE STUDY TIME:
${availableMinutes} minutes


Create a study plan that fits within the available time.

Prioritize subjects based on:
- upcoming exam dates
- confidence level
- incomplete topics
- unfinished tasks

Do not invent subjects or tasks.

Include:
1. Subject
2. Task/topic
3. Duration
4. Short goal

Include breaks if appropriate.

Keep the total study time within the available time.

Make the plan practical for a college student.
`;


    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",

      {
        model: "openrouter/free",

        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },

      {
        headers: {
          "Authorization":
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type":
            "application/json"
        }
      }
    );


    const plan =
      response.data.choices[0].message.content;
    const dbResult = await pool.query(
  "INSERT INTO study_plans (plan) VALUES ($1) RETURNING *",
  [plan]
);

    res.status(201).json({
  plan: dbResult.rows[0].plan,
  id: dbResult.rows[0].id,
  createdAt: dbResult.rows[0].created_at
});


  } catch (error) {

    console.log(
      "AI study plan error:",
      error.response?.data ||
      error.message
    );


    res.status(500).json({
      error: "Could not generate study plan"
    });

  }

});

app.get("/api/study-plans", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM study_plans ORDER BY created_at DESC"
    );

    res.json(result.rows);

  } catch (error) {

    console.log("Study plans error:", error);

    res.status(500).json({
      error: "Could not load study plans"
    });

  }

});


// =========================
// SETTINGS
// =========================

// Get saved settings
app.get("/api/settings", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM settings WHERE id = 1"
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: "Settings not found"
      });

    }

    res.json(result.rows[0]);

  } catch (error) {

    console.log(
      "Error getting settings:",
      error.message
    );

    res.status(500).json({
      error: "Failed to load settings"
    });

  }

});


// Save settings
app.put("/api/settings", async (req, res) => {

  const {
    dailyStudyGoal,
    preferredStudyTime,
    aiRecommendations
  } = req.body;

  try {

    const result = await pool.query(
      `
      UPDATE settings
      SET
        daily_study_goal = $1,
        preferred_study_time = $2,
        ai_recommendations = $3
      WHERE id = 1
      RETURNING *
      `,
      [
        dailyStudyGoal,
        preferredStudyTime,
        aiRecommendations
      ]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: "Settings not found"
      });

    }

    res.json(result.rows[0]);

  } catch (error) {

    console.log(
      "Error saving settings:",
      error.message
    );

    res.status(500).json({
      error: "Failed to save settings"
    });

  }

});

// Start server
app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );

});