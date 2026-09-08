import { useEffect, useState } from "react";

function Planner() {

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    loadTasks();

  }, []);


  async function loadTasks() {

    try {
      
      setError("");
      const response = await fetch(
        "http://localhost:5000/api/tasks"
      );

      if (!response.ok) {
        throw new Error("Failed to load tasks");
      }

      const data = await response.json();

      setTasks(data);

    } catch (error) {

      console.log("Error:", error);
      setError(
        "Couldn't load your study tasks. Make sure the server is running."
      );
    } finally {

      setLoading(false);

    }

  }


  async function toggleTask(task) {

    try {

      const response = await fetch(
        `http://localhost:5000/api/tasks/${task.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            completed: !task.completed
          })
        }
      );


      if (!response.ok) {
        throw new Error("Failed to update task");
      }


      const updatedTask =
        await response.json();


      setTasks(previousTasks =>
        previousTasks.map(item =>
          item.id === task.id
            ? updatedTask
            : item
        )
      );


    } catch (error) {

      console.log("Error:", error);

    }

  }


  async function deleteTask(id) {

    const confirmed = window.confirm(
      "Delete this task?"
    );


    if (!confirmed) {
      return;
    }


    try {

      const response = await fetch(
        `http://localhost:5000/api/tasks/${id}`,
        {
          method: "DELETE"
        }
      );


      if (!response.ok) {
        throw new Error("Failed to delete task");
      }


      setTasks(previousTasks =>
        previousTasks.filter(
          task => task.id !== id
        )
      );


    } catch (error) {

      console.log("Error:", error);

    }

  }


  const completedTasks =
    tasks.filter(
      task => task.completed
    ).length;


  const remainingTasks =
    tasks.length - completedTasks;


  return (

    <div>

      <h1>
        Today's Study Plan 📅
      </h1>


      <p className="subtitle">
        Stay on track with your study tasks.
      </p>


      <div className="planner-summary">

        <div>
          <strong>
            {tasks.length}
          </strong>

          <span>
            Total
          </span>
        </div>


        <div>
          <strong>
            {completedTasks}
          </strong>

          <span>
            Completed
          </span>
        </div>


        <div>
          <strong>
            {remainingTasks}
          </strong>

          <span>
            Remaining
          </span>
        </div>

      </div>


      <div className="today">
        

        {error && (
  <div className="error-message">
    {error}
  </div>
)}
        <h2>
          📋 Study Tasks
        </h2>


        {loading ? (

          <p>
            Loading tasks...
          </p>

        ) : tasks.length === 0 ? (

          <div className="empty-state">

            <h3>
              🎉 No tasks yet
            </h3>

            <p>
              Your study planner is empty.
              Generate a study plan with the
              AI Assistant to create tasks.
            </p>

          </div>

        ) : (

          <div className="task-list">

            {tasks.map(task => (

              <div
                className={
                  task.completed
                    ? "task-card completed"
                    : "task-card"
                }
                key={task.id}
              >

                <div className="task-main">

                  <label>

                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() =>
                        toggleTask(task)
                      }
                    />


                    <span
                      className={
                        task.completed
                          ? "task-title completed-title"
                          : "task-title"
                      }
                    >
                      {task.title}
                    </span>

                  </label>


                  <p>
                    📚 {task.subject_name}
                  </p>


                  <p>
                    {task.topic_name
                      ? `📖 ${task.topic_name}`
                      : "📖 General"
                    }
                  </p>


                  <p>
                    ⏱️ {task.duration} minutes
                  </p>

                </div>


                <div className="task-status">

                  <span>
                    {task.completed
                      ? "✅ Completed"
                      : "⏳ In progress"
                    }
                  </span>


                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteTask(task.id)
                    }
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}


export default Planner;