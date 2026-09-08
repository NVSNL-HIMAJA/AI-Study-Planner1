import { useEffect, useState } from "react";

function Subjects({ setCurrentPage, setSelectedSubject }) {

  const [subjects, setSubjects] = useState([]);

  const [subjectName, setSubjectName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [confidence, setConfidence] = useState(5);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    loadSubjects();

  }, []);


  async function loadSubjects() {

    try {

      setError("");

      const response = await fetch(
        "http://localhost:5000/api/subjects"
      );


      if (!response.ok) {
        throw new Error("Failed to load subjects");
      }


      const data = await response.json();

      setSubjects(data);


    } catch (error) {

      console.log("Subjects error:", error);

      setError(
        "Couldn't load your subjects. Make sure the server is running."
      );


    } finally {

      setLoading(false);

    }

  }


  async function addSubject(event) {

    event.preventDefault();


    if (subjectName.trim() === "") {

      alert("Please enter a subject name.");

      return;

    }


    try {

      if (editingId !== null) {

        const response = await fetch(
          `http://localhost:5000/api/subjects/${editingId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              name: subjectName.trim(),
              examDate: examDate,
              confidence: confidence
            })
          }
        );


        if (!response.ok) {
          throw new Error("Failed to update subject");
        }


        const updatedSubject =
          await response.json();


        setSubjects(previousSubjects =>
          previousSubjects.map(subject =>
            subject.id === editingId
              ? updatedSubject
              : subject
          )
        );


        cancelEditing();

        return;

      }


      const response = await fetch(
        "http://localhost:5000/api/subjects",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name: subjectName.trim(),
            examDate: examDate,
            confidence: confidence
          })
        }
      );


      if (!response.ok) {
        throw new Error("Failed to add subject");
      }


      const savedSubject =
        await response.json();


      setSubjects(previousSubjects => [
        ...previousSubjects,
        savedSubject
      ]);


      clearForm();


    } catch (error) {

      console.log("Subject save error:", error);

      alert(
        "Something went wrong. Please try again."
      );

    }

  }


  async function deleteSubject(id) {

    const confirmed = window.confirm(
      "Are you sure you want to delete this subject?"
    );


    if (!confirmed) {
      return;
    }


    try {

      const response = await fetch(
        `http://localhost:5000/api/subjects/${id}`,
        {
          method: "DELETE"
        }
      );


      if (!response.ok) {
        throw new Error("Failed to delete subject");
      }


      setSubjects(previousSubjects =>
        previousSubjects.filter(
          subject => subject.id !== id
        )
      );


    } catch (error) {

      console.log("Delete subject error:", error);

      alert(
        "Couldn't delete the subject. Please try again."
      );

    }

  }


  function startEditing(subject) {

    setEditingId(subject.id);

    setSubjectName(subject.name);

    setExamDate(subject.exam_date || "");

    setConfidence(subject.confidence);

  }


  function clearForm() {

    setSubjectName("");

    setExamDate("");

    setConfidence(5);

    setEditingId(null);

  }


  function cancelEditing() {

    clearForm();

  }


  function openTopics(subject) {

    setSelectedSubject(subject);

    setCurrentPage("topics");

  }


  if (loading) {

    return (

      <div>

        <h1>
          Your Subjects 📚
        </h1>

        <div className="today">

          <h2>
            ⏳ Loading subjects...
          </h2>

          <p>
            Getting your subjects.
          </p>

        </div>

      </div>

    );

  }


  if (error) {

    return (

      <div>

        <h1>
          Your Subjects 📚
        </h1>

        <div className="today">

          <h2>
            ⚠️ Something went wrong
          </h2>

          <p>
            {error}
          </p>

        </div>

      </div>

    );

  }


  return (

    <div>

      <h1>
        Your Subjects 📚
      </h1>


      <p className="subtitle">
        Manage your subjects and topics.
      </p>


      <div className="today">

        <h2>
          {editingId !== null
            ? "Edit Subject"
            : "Add a Subject"
          }
        </h2>


        <form onSubmit={addSubject}>

          <div className="form-group">

            <label>
              Subject name
            </label>

            <input
              type="text"
              placeholder="e.g. Data Structures"
              value={subjectName}
              onChange={(event) =>
                setSubjectName(event.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>
              Exam date
            </label>

            <input
              type="date"
              value={examDate}
              onChange={(event) =>
                setExamDate(event.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>
              Confidence: {confidence}/10
            </label>

            <input
              type="range"
              min="1"
              max="10"
              value={confidence}
              onChange={(event) =>
                setConfidence(
                  Number(event.target.value)
                )
              }
            />

          </div>


          <button
            className="add-button"
            type="submit"
          >
            {editingId !== null
              ? "Save Changes"
              : "+ Add Subject"
            }
          </button>


          {editingId !== null && (

            <button
              type="button"
              onClick={cancelEditing}
            >
              Cancel
            </button>

          )}

        </form>

      </div>


      <div className="today">

        <h2>
          Your Subjects
        </h2>


        {subjects.length === 0 ? (

          <p>
            You haven't added any subjects yet.
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
                Exam:{" "}
                {subject.exam_date || "Not set"}
              </p>


              <p>
                Confidence:{" "}
                {subject.confidence}/10
              </p>


              <button
                onClick={() =>
                  openTopics(subject)
                }
              >
                📚 View Topics
              </button>


              <button
                className="edit-button"
                onClick={() =>
                  startEditing(subject)
                }
              >
                ✏️ Edit
              </button>


              <button
                className="delete-button"
                onClick={() =>
                  deleteSubject(subject.id)
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


export default Subjects;