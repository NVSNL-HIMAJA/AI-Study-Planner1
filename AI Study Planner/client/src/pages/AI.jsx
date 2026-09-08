import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

function AI() {
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [availableMinutes, setAvailableMinutes] = useState(120);
  const [studyPlan, setStudyPlan] = useState("");
  const [planLoading, setPlanLoading] = useState(false);

  const [savedPlans, setSavedPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    try {
      const [subjectsResponse, tasksResponse] = await Promise.all([
        fetch("http://localhost:5000/api/study-priority"),
        fetch("http://localhost:5000/api/tasks")
      ]);

      if (!subjectsResponse.ok || !tasksResponse.ok) {
        throw new Error("Failed to load study data");
      }

      const subjectsData = await subjectsResponse.json();
      const tasksData = await tasksResponse.json();

      setSubjects(subjectsData);
      setTasks(tasksData);
    } catch (error) {
      console.log("Study data error:", error);
    }

    loadSavedPlans();
  }

  async function loadSavedPlans() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/study-plans"
      );

      if (!response.ok) {
        throw new Error("Failed to load saved plans");
      }

      const data = await response.json();
      setSavedPlans(data);
    } catch (error) {
      console.log("Saved plans error:", error);
    }
  }

  function getPlanText(plan) {
    return plan.plan || plan.study_plan || plan.content || "";
  }

  function getPlanLabel(plan, index) {
    const createdAt = plan.created_at || plan.createdAt;
    const date = createdAt
      ? new Date(createdAt).toLocaleString()
      : `Saved plan ${index + 1}`;

    const minutes =
      plan.available_minutes ||
      plan.availableMinutes ||
      plan.duration;

    return minutes
      ? `${date} — ${minutes} minutes`
      : date;
  }

  const selectedPlan = savedPlans.find(
    plan => String(plan.id) === selectedPlanId
  );

  async function askAI(event) {
    event.preventDefault();

    if (message.trim() === "" || loading) {
      return;
    }

    const userMessage = message.trim();

    setMessages(previous => [
      ...previous,
      {
        role: "user",
        text: userMessage
      }
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/ai-chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: userMessage,
            subjects: subjects,
            tasks: tasks,
            conversation: messages
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI request failed");
      }

      setMessages(previous => [
        ...previous,
        {
          role: "ai",
          text: data.answer
        }
      ]);
    } catch (error) {
      console.log("AI chat error:", error);

      setMessages(previous => [
        ...previous,
        {
          role: "ai",
          text: "Sorry, I couldn't get a response from the AI."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function generateStudyPlan() {
    if (planLoading) {
      return;
    }

    setPlanLoading(true);
    setStudyPlan("");
    setSelectedPlanId("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/ai-study-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            subjects: subjects,
            tasks: tasks,
            availableMinutes: Number(availableMinutes)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Study plan request failed"
        );
      }

      setStudyPlan(data.plan);
      loadSavedPlans();
    } catch (error) {
      console.log("Study plan error:", error);

      setStudyPlan(
        "Sorry, I couldn't generate your study plan."
      );
    } finally {
      setPlanLoading(false);
    }
  }

  return (
    <div>
      <h1>🤖 AI Study Assistant</h1>

      <p className="subtitle">
        Your personal AI study companion.
      </p>

      <div className="today">
        <h2>📅 Generate Today&apos;s Study Plan</h2>

        <p>
          Tell the AI how much time you have and it will
          create a personalized plan.
        </p>

        <div className="form-group">
          <label>Available study time</label>

          <select
            value={availableMinutes}
            onChange={(event) =>
              setAvailableMinutes(event.target.value)
            }
          >
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="120">2 hours</option>
            <option value="180">3 hours</option>
            <option value="240">4 hours</option>
          </select>
        </div>

        <button
          className="add-button"
          onClick={generateStudyPlan}
          disabled={planLoading}
        >
          {planLoading
            ? "🤖 Creating plan..."
            : "✨ Generate Study Plan"}
        </button>

        {studyPlan && (
          <div className="subject-card">
            <h3>📚 Your AI Study Plan</h3>
            <div className="ai-markdown">
  <ReactMarkdown>
    {studyPlan}
  </ReactMarkdown>
</div>
          </div>
        )}
      </div>

      <div className="today">
        <h2>📚 Study Plan History</h2>

        {savedPlans.length === 0 ? (
          <p>No saved study plans yet.</p>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="saved-study-plan">
                Choose a saved plan
              </label>

              <select
                id="saved-study-plan"
                value={selectedPlanId}
                onChange={(event) =>
                  setSelectedPlanId(event.target.value)
                }
              >
                <option value="">Select a study plan...</option>

                {savedPlans.map((plan, index) => (
                  <option key={plan.id} value={plan.id}>
                    {getPlanLabel(plan, index)}
                  </option>
                ))}
              </select>
            </div>

            {selectedPlan && (
              <div className="subject-card">
                <h3>📅 {getPlanLabel(
                  selectedPlan,
                  savedPlans.indexOf(selectedPlan)
                )}</h3>

                <div className="ai-markdown">
  <ReactMarkdown>
    {getPlanText(selectedPlan)}
  </ReactMarkdown>
</div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="today">
        <h2>💬 Study Chat</h2>

        <div className="ai-chat">
          {messages.length === 0 ? (
            <div className="ai-welcome">
              <h3>👋 Hey! I&apos;m your study assistant.</h3>
              <p>
                Ask me anything about your study plan,
                subjects, tasks, or exams.
              </p>
            </div>
          ) : (
            messages.map((item, index) => (
              <div
                key={index}
                className={
                  item.role === "user"
                    ? "chat-message user-message"
                    : "chat-message ai-message"
                }
              >
                <strong>
                  {item.role === "user" ? "You" : "🤖 AI"}
                </strong>

                <div className="ai-markdown">
  {item.role === "ai" ? (
    <ReactMarkdown>
      {item.text}
    </ReactMarkdown>
  ) : (
    <p>{item.text}</p>
  )}
</div>
              </div>
            ))
          )}

          {loading && (
            <div className="chat-message ai-message">
              <strong>🤖 AI</strong>
              <p>Thinking...</p>
            </div>
          )}
        </div>

        <form onSubmit={askAI}>
          <div className="form-group">
            <label>Your question</label>

            <textarea
              rows="3"
              placeholder="Ask something like: I have 2 hours today. What should I study?"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
            />
          </div>

          <button
            className="add-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "🤖 Thinking..." : "✨ Ask AI"}
          </button>
        </form>
      </div>

      <div className="today">
        <h2>💡 Try asking</h2>
        <p>&quot;Which subject should I focus on?&quot;</p>
        <p>&quot;Which subject am I weakest in?&quot;</p>
        <p>&quot;Make me a study plan for tonight.&quot;</p>
        <p>
          &quot;Should I study DBMS or Operating Systems?&quot;
        </p>
      </div>
    </div>
  );
}

export default AI;