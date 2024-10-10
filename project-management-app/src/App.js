import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Task from "./pages/Task";
import TaskDetail from "./components/TaskDetails";
import ProjectDetails from "./components/projectDetails";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/projects/:projectId/tasks" element={<Task />} />
        <Route path="/tasks/:taskId/project/:projectId" element={<TaskDetail />} />
        <Route path="/projects/:id" element={<ProjectDetails/>} />
      </Routes>
    </Router>
  );
};

export default App;
