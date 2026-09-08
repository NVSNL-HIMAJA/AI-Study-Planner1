import { useEffect, useState } from "react";

function Settings() {

  const [dailyStudyGoal, setDailyStudyGoal] = useState(3);
  const [preferredStudyTime, setPreferredStudyTime] = useState("Evening");
  const [aiRecommendations, setAiRecommendations] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {

    async function loadSettings() {

      try {

        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/settings"
        );

        if (!response.ok) {
          throw new Error("Failed to load settings");
        }

        const data = await response.json();

        setDailyStudyGoal(data.daily_study_goal);
        setPreferredStudyTime(data.preferred_study_time);
        setAiRecommendations(data.ai_recommendations);

      } catch (error) {

        console.log("Settings loading error:", error);

        setError(
          "Couldn't load your settings. Make sure the server is running."
        );

      } finally {

        setLoading(false);

      }

    }

    loadSettings();

  }, []);


  async function saveSettings(event) {

    event.preventDefault();

    try {

      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        "http://localhost:5000/api/settings",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            dailyStudyGoal: Number(dailyStudyGoal),
            preferredStudyTime,
            aiRecommendations
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await response.json();

      setDailyStudyGoal(data.daily_study_goal);
      setPreferredStudyTime(data.preferred_study_time);
      setAiRecommendations(data.ai_recommendations);

      setSuccess("Settings saved successfully.");

    } catch (error) {

      console.log("Settings saving error:", error);

      setError(
        "Couldn't save your settings. Please try again."
      );

    } finally {

      setSaving(false);

    }

  }


  if (loading) {

    return (
      <div>

        <h1>Settings</h1>

        <p className="subtitle">
          Customize your study experience.
        </p>

        <div className="today">

          <h2>Loading settings...</h2>

          <p>
            Getting your saved study preferences.
          </p>

        </div>

      </div>
    );

  }


  return (
    <div>

      <h1>Settings</h1>

      <p className="subtitle">
        Customize your study experience.
      </p>


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {success && (
        <div className="success-message">
          {success}
        </div>
      )}


      <form onSubmit={saveSettings}>

        <div className="today">

          <h2>Study Preferences</h2>

          <div className="settings-group">

            <label htmlFor="study-goal">
              Daily study goal
            </label>

            <select
              id="study-goal"
              value={dailyStudyGoal}
              onChange={(event) =>
  setDailyStudyGoal(Number(event.target.value))
}
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
              <option value="5">5 hours</option>
              <option value="6">6 hours</option>
              <option value="7">7 hours</option>
              <option value="8">8 hours</option>
            </select>

          </div>


          <div className="settings-group">

            <label htmlFor="study-time">
              Preferred study time
            </label>

            <select
              id="study-time"
              value={preferredStudyTime}
              onChange={(event) =>
                setPreferredStudyTime(event.target.value)
              }
            >

              <option value="Morning">
                Morning
              </option>

              <option value="Afternoon">
                Afternoon
              </option>

              <option value="Evening">
                Evening
              </option>

              <option value="Night">
                Night
              </option>

            </select>

          </div>


          <div className="settings-option">

            <div>

              <strong>
                AI recommendations
              </strong>

              <p>
                Allow the planner to provide personalized study recommendations.
              </p>

            </div>

            <label className="switch">

              <input
                type="checkbox"
                checked={aiRecommendations}
                onChange={(event) =>
                  setAiRecommendations(
                    event.target.checked
                  )
                }
              />

              <span className="slider"></span>

            </label>

          </div>


          <button
            className="add-button settings-save"
            type="submit"
            disabled={saving}
          >

            {saving
              ? "Saving..."
              : "Save Settings"
            }

          </button>

        </div>

      </form>

    </div>
  );

}

export default Settings;