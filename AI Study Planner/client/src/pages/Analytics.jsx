import { useEffect, useState } from "react";

function Analytics() {

  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function loadAnalytics() {

      try {

        const subjectsResponse = await fetch(
          "http://localhost:5000/api/subjects"
        );

        const tasksResponse = await fetch(
          "http://localhost:5000/api/tasks"
        );


        const subjectsData =
          await subjectsResponse.json();

        const tasksData =
          await tasksResponse.json();


        setSubjects(subjectsData);
        setTasks(tasksData);


      } catch (error) {

        console.log(
          "Analytics error:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    loadAnalytics();

  }, []);


  if (loading) {

    return (
      <div>

        <h1>
          Analytics 📊
        </h1>

        <p>
          Loading analytics...
        </p>

      </div>
    );

  }


  const completedTasks =
    tasks.filter(
      task => task.completed
    ).length;


  const totalTasks = tasks.length;


  const overallProgress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );


  function getSubjectTasks(subject) {

    return tasks.filter(
      task =>
        task.subject_name === subject.name
    );

  }


  return (

    <div>

      <h1>
        Analytics 📊
      </h1>

      <p className="subtitle">
        Track your study progress.
      </p>


      <div className="today">

        <h2>
          📈 Overall Progress
        </h2>

        <h1>
          {overallProgress}%
        </h1>

        <p>
          {completedTasks} of{" "}
          {totalTasks} tasks completed.
        </p>


        <div className="progress-container">

          <div
            className="progress-bar"
            style={{
              width:
                `${overallProgress}%`
            }}
          />

        </div>

      </div>


      <div className="today">

        <h2>
          📚 Subject Progress
        </h2>


        {subjects.length === 0 ? (

          <p>
            No subjects yet.
          </p>

        ) : (

          subjects.map(subject => {

            const subjectTasks =
              getSubjectTasks(subject);


            const completed =
              subjectTasks.filter(
                task => task.completed
              ).length;


            const total =
              subjectTasks.length;


            const progress =
              total === 0
                ? 0
                : Math.round(
                    (completed / total) * 100
                  );


            return (

              <div
                className="subject-card"
                key={subject.id}
              >

                <h3>
                  📚 {subject.name}
                </h3>


                <p>
                  {completed} of {total} tasks
                  completed
                </p>


                <div className="progress-container">

                  <div
                    className="progress-bar"
                    style={{
                      width:
                        `${progress}%`
                    }}
                  />

                </div>


                <strong>
                  {progress}%
                </strong>

              </div>

            );

          })

        )}

      </div>


      <div className="today">

        <h2>
          📋 Task Summary
        </h2>


        <p>
          📋 Total tasks:{" "}
          <strong>{totalTasks}</strong>
        </p>


        <p>
          ✅ Completed:{" "}
          <strong>{completedTasks}</strong>
        </p>


        <p>
          ⏳ Remaining:{" "}
          <strong>
            {totalTasks - completedTasks}
          </strong>
        </p>

      </div>

    </div>

  );

}

export default Analytics;