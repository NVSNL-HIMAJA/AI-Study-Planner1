import { useEffect, useState } from "react";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState("Focus");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [tasksResponse, subjectsResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/tasks"),
            fetch("http://localhost:5000/api/subjects"),
          ]);

        const tasksData = await tasksResponse.json();
        const subjectsData =
          await subjectsResponse.json();

        setTasks(tasksData);
        setSubjects(subjectsData);
      } catch (error) {
        console.log(
          "Dashboard loading error:",
          error
        );
      }
    }

    loadDashboard();
  }, []);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((seconds) => {
        if (seconds <= 1) {
          setTimerRunning(false);

          if (timerMode === "Focus") {
            setTimerMode("Break");
            return 5 * 60;
          } else {
            setTimerMode("Focus");
            return 25 * 60;
          }
        }

        return seconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, timerMode]);

  const completedTasks = tasks.filter(
    (task) => task.completed
  );

  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const remainingCount =
    totalTasks - completedCount;

  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedCount / totalTasks) * 100
        );

  const totalMinutes = tasks.reduce(
    (sum, task) =>
      sum + Number(task.duration || 0),
    0
  );

  const completedMinutes =
    completedTasks.reduce(
      (sum, task) =>
        sum + Number(task.duration || 0),
      0
    );

  function getStreak() {
    try {
      const dates =
        JSON.parse(
          localStorage.getItem(
            "studyActivityDates"
          )
        ) || [];

      if (dates.length === 0) return 0;

      const uniqueDates = [
        ...new Set(dates),
      ].sort((a, b) =>
        b.localeCompare(a)
      );

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const todayString =
        today.toISOString().split("T")[0];

      const yesterday = new Date(today);
      yesterday.setDate(
        yesterday.getDate() - 1
      );

      const yesterdayString =
        yesterday.toISOString().split("T")[0];

      if (
        uniqueDates[0] !== todayString &&
        uniqueDates[0] !== yesterdayString
      ) {
        return 0;
      }

      let streak = 0;
      let currentDate =
        uniqueDates[0] === todayString
          ? today
          : yesterday;

      for (const date of uniqueDates) {
        const expected =
          currentDate
            .toISOString()
            .split("T")[0];

        if (date === expected) {
          streak++;

          currentDate = new Date(
            currentDate
          );

          currentDate.setDate(
            currentDate.getDate() - 1
          );
        } else {
          break;
        }
      }

      return streak;
    } catch {
      return 0;
    }
  }

  function formatTime(seconds) {
    const minutes = Math.floor(
      seconds / 60
    );
    const remainingSeconds =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  function resetTimer() {
    setTimerRunning(false);
    setTimerMode("Focus");
    setTimerSeconds(25 * 60);
  }

  function skipTimer() {
    setTimerRunning(false);

    if (timerMode === "Focus") {
      setTimerMode("Break");
      setTimerSeconds(5 * 60);
    } else {
      setTimerMode("Focus");
      setTimerSeconds(25 * 60);
    }
  }

  function getSubjectProgress(subject) {
    const subjectTasks = tasks.filter(
      (task) =>
        Number(task.subject_id) ===
        Number(subject.id)
    );

    if (subjectTasks.length === 0) {
      return 0;
    }

    const completed = subjectTasks.filter(
      (task) => task.completed
    ).length;

    return Math.round(
      (completed /
        subjectTasks.length) *
        100
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <p className="subtitle">
        Keep track of your study progress.
      </p>

      {/* TOP STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div>
            <h3>{subjects.length}</h3>
            <p>Subjects</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div>
            <h3>{totalTasks}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div>
            <h3>{completedCount}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div>
            <h3>{getStreak()}</h3>
            <p>Day Streak</p>
          </div>
        </div>
      </div>

      {/* STUDY OVERVIEW */}
      <div className="today">
        <h2>Study Overview 📊</h2>

        <div className="overview-grid">
          <div className="overview-item">
            <span>Planned study time</span>
            <strong>
              {Math.floor(totalMinutes / 60)}h{" "}
              {totalMinutes % 60}m
            </strong>
          </div>

          <div className="overview-item">
            <span>Completed study time</span>
            <strong>
              {Math.floor(
                completedMinutes / 60
              )}
              h {completedMinutes % 60}m
            </strong>
          </div>

          <div className="overview-item">
            <span>Remaining tasks</span>
            <strong>{remainingCount}</strong>
          </div>
        </div>

        <div className="progress-header">
          <span>Overall Progress</span>
          <strong>
            {completionPercentage}%
          </strong>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${completionPercentage}%`,
            }}
          ></div>
        </div>
      </div>

      {/* SUBJECT PROGRESS */}
      <div className="today">
        <h2>Subject Progress 📚</h2>

        {subjects.length === 0 ? (
          <p>No subjects added yet.</p>
        ) : (
          <div className="subject-progress-list">
            {subjects.map((subject) => {
              const progress =
                getSubjectProgress(
                  subject
                );

              return (
                <div
                  className="subject-progress-item"
                  key={subject.id}
                >
                  <div className="subject-progress-header">
                    <span>
                      {subject.name}
                    </span>

                    <strong>
                      {progress}%
                    </strong>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${progress}%`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POMODORO */}
      <div className="today focus-card">
        <div className="focus-heading">
          <div>
            <h2>Focus Mode 🎯</h2>
            <p>
              {timerMode === "Focus"
                ? "25 minutes of focused study"
                : "Take a short break"}
            </p>
          </div>

          <span className="focus-mode-badge">
            {timerMode}
          </span>
        </div>

        <div className="pomodoro-timer">
          {formatTime(timerSeconds)}
        </div>

        <div className="pomodoro-controls">
          <button
            className="add-button"
            onClick={() =>
              setTimerRunning(
                !timerRunning
              )
            }
          >
            {timerRunning
              ? "⏸ Pause"
              : "▶ Start"}
          </button>

          <button
            className="secondary-button"
            onClick={resetTimer}
          >
            ↻ Reset
          </button>

          <button
            className="secondary-button"
            onClick={skipTimer}
          >
            Skip →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;