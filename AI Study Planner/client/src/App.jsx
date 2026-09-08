import { useState } from "react";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Planner from "./pages/Planner";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Topics from "./pages/Topics";
import Tasks from "./pages/Tasks";
import AI from "./pages/AI";


function App() {

  const [currentPage, setCurrentPage] =
    useState("dashboard");

  const [selectedSubject, setSelectedSubject] =
    useState(null);


  function openTopics(subject) {

    setSelectedSubject(subject);

    setCurrentPage("topics");

  }


  function renderPage() {


    if (currentPage === "dashboard") {
      return <Dashboard />;
    }


    if (currentPage === "subjects") {

      return (
        <Subjects
          setCurrentPage={setCurrentPage}
          setSelectedSubject={setSelectedSubject}
        />
      );

    }


    if (currentPage === "topics") {

      if (!selectedSubject) {

        setCurrentPage("subjects");

        return null;

      }


      return (
        <Topics
          subject={selectedSubject}
          setCurrentPage={setCurrentPage}
        />
      );

    }

    if (currentPage === "tasks") {

      if (!selectedSubject) {

        setCurrentPage("subjects");

        return null;

      }
      return (
        <Tasks
          subject={selectedSubject}
          setCurrentPage={setCurrentPage}
        />
      );

    }


    if (currentPage === "planner") {
      return <Planner />;
    }


    if (currentPage === "analytics") {
      return <Analytics />;
    }


    if (currentPage === "settings") {
      return <Settings />;
    }


    if (currentPage === "ai") {
      return <AI />;
    }


    return <Dashboard />;

  }


  return (

    <div className="app-layout">

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />


      <main className="main-content">

        {renderPage()}

      </main>

    </div>

  );

}


export default App;