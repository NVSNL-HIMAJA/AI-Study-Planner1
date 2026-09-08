import { useEffect, useState } from "react";

function Priority() {

  const [subjects, setSubjects] = useState([]);

  useEffect(() => {

    fetch("http://localhost:5000/api/study-priority")
      .then(response => response.json())
      .then(data => {
        setSubjects(data);
      })
      .catch(error => {
        console.log("Error:", error);
      });

  }, []);


  return (

    <div>

      <h1>Study Priority 🧠</h1>

      <p className="subtitle">
        Subjects that need your attention first.
      </p>


      <div className="today">

        <h2>Priority List</h2>


        {subjects.length === 0 ? (

          <p>
            No subjects available.
          </p>

        ) : (

          subjects.map(subject => (

            <div
              className="subject-card"
              key={subject.id}
            >

              <h3>
                {subject.name}
              </h3>


              <p>
                📅 Exam:{" "}
                {subject.examDate || "Not set"}
              </p>


              <p>
                ⏳ Days until exam:{" "}
                {subject.daysUntilExam}
              </p>


              <p>
                💪 Confidence:{" "}
                {subject.confidence}/10
              </p>


              <p>
                📚 Topics:{" "}
                {subject.completedTopics}/
                {subject.totalTopics}
              </p>


              <p>
                📊 Completion:{" "}
                {subject.completionPercentage}%
              </p>


              <h3>
                {subject.priority === "High"
                  ? "🔥 HIGH PRIORITY"
                  : subject.priority === "Medium"
                  ? "⚠️ MEDIUM PRIORITY"
                  : "🟢 LOW PRIORITY"
                }
              </h3>


              <p>
                Priority score:{" "}
                {subject.priorityScore}
              </p>

            </div>

          ))

        )}

      </div>

    </div>

  );

}

export default Priority;