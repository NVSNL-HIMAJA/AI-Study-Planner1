import { useEffect, useMemo, useState } from "react";

function Tasks({ subject, setCurrentPage }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [topics, setTopics] = useState([]);
  const [topicId, setTopicId] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const subjectId = subject.id;

  useEffect(() => {
    fetch(`http://localhost:5000/api/subjects/${subjectId}/tasks`)
      .then((response) => response.json())
      .then((data) => {
        setTasks(data);
      })
      .catch((error) => {
        console.log("Error:", error);
      });

    fetch(`http://localhost:5000/api/subjects/${subjectId}/topics`)
      .then((response) => response.json())
      .then((data) => {
        setTopics(data);
      })
      .catch((error) => {
        console.log("Error loading topics:", error);
      });
  }, [subjectId]);

  function getPriorities() {
    try {
      return JSON.parse(localStorage.getItem("taskPriorities")) || {};
    } catch {
      return {};
    }
  }

  function savePriority(taskId, value) {
    const priorities = getPriorities();
    priorities[taskId] = value;
    localStorage.setItem("taskPriorities", JSON.stringify(priorities));
  }

  function getTaskPriority(taskId) {
    const priorities = getPriorities();
    return priorities[taskId] || "Medium";
  }

  function recordStudyActivity() {
    const today = new Date().toISOString().split("T")[0];

    try {
      const dates =
        JSON.parse(localStorage.getItem("studyActivityDates")) || [];

      if (!dates.includes(today)) {
        dates.push(today);
      }

      localStorage.setItem(
        "studyActivityDates",
        JSON.stringify(dates)
      );
    } catch (error) {
      console.log("Could not save study activity:", error);
    }
  }

  async function addTask(event) {
    event.preventDefault();

    if (title.trim() === "") {
      alert("Please enter a task.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/subjects/${subjectId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            duration: Number(duration),
            topicId: topicId || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const newTask = await response.json();

      savePriority(newTask.id, priority);

      setTasks([...tasks, newTask]);

      setTitle("");
      setDuration(30);
      setTopicId("");
      setPriority("Medium");
    } catch (error) {
      console.log("Error:", error);
    }
  }

  async function toggleTask(task) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: !task.completed,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      if (!task.completed) {
        recordStudyActivity();
      }

      setTasks(
        tasks.map((item) =>
          item.id === task.id ? updatedTask : item
        )
      );
    } catch (error) {
      console.log("Error:", error);
    }
  }

  function changePriority(taskId, value) {
    savePriority(taskId, value);

    setTasks([...tasks]);
  }

  async function deleteTask(id) {
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "DELETE",
      });

      const priorities = getPriorities();
      delete priorities[id];

      localStorage.setItem(
        "taskPriorities",
        JSON.stringify(priorities)
      );

      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.log("Error:", error);
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const taskPriority = getTaskPriority(task.id);

      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesPriority =
        priorityFilter === "All" ||
        taskPriority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, search, priorityFilter]);

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  return (
    <div>
      <button
        className="back-button"
        onClick={() => setCurrentPage("subjects")}
      >
        ← Back to Subjects
      </button>

      <h1>{subject.name} — Study Tasks 📝</h1>

      <p className="subtitle">
        Break your studying into manageable tasks.
      </p>

      {/* ADD TASK */}
      <div className="today">
        <h2>Add a Task</h2>

        <form onSubmit={addTask} className="task-form">
          <div className="form-group">
            <label htmlFor="task-topic">Topic</label>

            <select
              id="task-topic"
              value={topicId}
              onChange={(event) =>
                setTopicId(event.target.value)
              }
            >
              <option value="">Select a topic</option>

              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-title">Task</label>

            <input
              id="task-title"
              type="text"
              placeholder="e.g. Practice SQL queries"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
            />
          </div>

          <div className="task-input-row">
            <div className="form-group">
              <label htmlFor="task-duration">
                Duration
              </label>

              <input
                id="task-duration"
                type="number"
                min="5"
                value={duration}
                onChange={(event) =>
                  setDuration(event.target.value)
                }
              />
            </div>

            <span className="minutes-label">minutes</span>
          </div>

          <div className="form-group">
            <label htmlFor="task-priority">Priority</label>

            <select
              id="task-priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
            >
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>

          <button className="add-button" type="submit">
            + Add Task
          </button>
        </form>
      </div>

      {/* TASK LIST */}
      <div className="today">
        <div className="task-header">
          <div>
            <h2>Your Tasks</h2>
            <p className="task-count">
              {completedCount} of {tasks.length} completed
            </p>
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="task-filters">
            <input
              type="text"
              placeholder="🔎 Search tasks..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
            >
              <option value="All">All priorities</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No tasks yet</h3>
            <p>Add your first study task above.</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔎</div>
            <h3>No matching tasks</h3>
            <p>Try changing your search or filter.</p>
          </div>
        ) : (
          <div className="task-list">
            {filteredTasks.map((task) => {
              const taskPriority = getTaskPriority(task.id);

              return (
                <div
                  className={`task-card ${
                    task.completed ? "task-completed" : ""
                  } priority-${taskPriority.toLowerCase()}`}
                  key={task.id}
                >
                  <div className="task-main">
                    <label className="task-checkbox">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task)}
                      />

                      <span className="custom-check"></span>

                      <span
                        className={
                          task.completed
                            ? "task-title completed"
                            : "task-title"
                        }
                      >
                        {task.title}
                      </span>
                    </label>

                    <div className="task-meta">
                      <span>
                        ⏱️ {task.duration} min
                      </span>

                      <span>
                        📚{" "}
                        {topics.find(
                          (topic) =>
                            topic.id === task.topic_id
                        )?.name || "General"}
                      </span>
                    </div>
                  </div>

                  <div className="task-actions">
                    <select
                      value={taskPriority}
                      onChange={(event) =>
                        changePriority(
                          task.id,
                          event.target.value
                        )
                      }
                      className={`priority-select priority-${taskPriority.toLowerCase()}`}
                    >
                      <option value="High">🔴 High</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Low">🟢 Low</option>
                    </select>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteTask(task.id)
                      }
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;
