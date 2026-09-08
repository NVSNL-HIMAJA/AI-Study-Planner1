import { useEffect, useState } from "react";

function Topics({ subject, setCurrentPage }) {

  const subjectId = subject.id;

  const [topics, setTopics] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function loadTopics() {

      try {

        const response = await fetch(
          `http://localhost:5000/api/subjects/${subjectId}/topics`
        );

        if (!response.ok) {
          throw new Error("Failed to load topics");
        }

        const data = await response.json();

        setTopics(data);

      } catch (error) {

        console.log("Error:", error);

      } finally {

        setLoading(false);

      }

    }

    loadTopics();

  }, [subjectId]);


  async function addTopic(event) {

    event.preventDefault();

    if (topicName.trim() === "") {
      alert("Please enter a topic name.");
      return;
    }


    try {

      const response = await fetch(
        `http://localhost:5000/api/subjects/${subjectId}/topics`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name: topicName.trim()
          })
        }
      );


      if (!response.ok) {
        throw new Error("Failed to add topic");
      }


      const newTopic =
        await response.json();


      setTopics(previousTopics => [
        ...previousTopics,
        newTopic
      ]);


      setTopicName("");


    } catch (error) {

      console.log("Error:", error);

    }

  }


  async function deleteTopic(id) {

    const confirmed = window.confirm(
      "Are you sure you want to delete this topic?"
    );


    if (!confirmed) {
      return;
    }


    try {

      const response = await fetch(
        `http://localhost:5000/api/topics/${id}`,
        {
          method: "DELETE"
        }
      );


      if (!response.ok) {
        throw new Error("Failed to delete topic");
      }


      setTopics(previousTopics =>
        previousTopics.filter(
          topic => topic.id !== id
        )
      );


    } catch (error) {

      console.log("Error:", error);

    }

  }


  async function toggleTopic(topic) {

    try {

      const response = await fetch(
        `http://localhost:5000/api/topics/${topic.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            completed: !topic.completed
          })
        }
      );


      if (!response.ok) {
        throw new Error("Failed to update topic");
      }


      const updatedTopic =
        await response.json();


      setTopics(previousTopics =>
        previousTopics.map(item =>
          item.id === topic.id
            ? updatedTopic
            : item
        )
      );


    } catch (error) {

      console.log("Error:", error);

    }

  }


  return (

    <div>

      <button
        onClick={() =>
          setCurrentPage("subjects")
        }
      >
        ← Back to Subjects
      </button>


      <button
        onClick={() =>
          setCurrentPage("tasks")
        }
      >
        📝 Study Tasks
      </button>


      <h1>
        Topics 📚
      </h1>


      <p className="subtitle">
        Manage the topics you need to study.
      </p>


      <div className="today">

        <h2>
          Add a Topic
        </h2>


        <form onSubmit={addTopic}>

          <input
            type="text"
            placeholder="e.g. Normalization"
            value={topicName}
            onChange={(event) =>
              setTopicName(event.target.value)
            }
          />


          <button
            className="add-button"
            type="submit"
          >
            + Add Topic
          </button>

        </form>

      </div>


      <div className="today">

        <h2>
          Your Topics
        </h2>


        {loading ? (

          <p>
            Loading topics...
          </p>

        ) : topics.length === 0 ? (

          <p>
            No topics added yet.
          </p>

        ) : (

          topics.map(topic => (

            <div
              className="subject-card"
              key={topic.id}
            >

              <h3>
                {topic.name}
              </h3>


              <label>

                <input
                  type="checkbox"
                  checked={topic.completed}
                  onChange={() =>
                    toggleTopic(topic)
                  }
                />


                {topic.completed
                  ? " Completed"
                  : " Mark as completed"
                }

              </label>


              <button
                className="delete-button"
                onClick={() =>
                  deleteTopic(topic.id)
                }
              >
                🗑️ Delete
              </button>

            </div>

          ))

        )}

      </div>

    </div>

  );

}

export default Topics;