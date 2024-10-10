import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Task = () => {
  const { projectId } = useParams(); // Grabs projectId from URL parameters
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("Low");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(
          `http://localhost:8000/api/v1/tasks/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setTasks(response.data.data.tasks);
        setLoading(false);
      } catch (error) {
        setError("Failed to load tasks");
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      const accessToken = localStorage.getItem("accessToken");

      const newTask = {
        name,
        startDate,
        endDate,
        priority,
      };

      await axios.post(
        `http://localhost:8000/api/v1/tasks/${projectId}`,
        newTask,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setName("");
      setStartDate("");
      setEndDate("");
      setPriority("Low");

      window.location.reload();
    } catch (error) {
      setError("Failed to create a task");
    }
  };

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  return (
    <div className="task-container">
      <h2>Tasks for Project</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleCreateTask}>
        <input
          type="text"
          placeholder="Task Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit">Create Task</button>
      </form>

      <div>
        {tasks.length === 0 ? (
          <p>No tasks available</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task._id}>
                <h3>{task.name}</h3>
                <p>Start: {new Date(task.startDate).toLocaleDateString()}</p>
                <p>End: {new Date(task.endDate).toLocaleDateString()}</p>
                <p>Priority: {task.priority}</p>
                <p>Status: {task.status}</p>
                <button onClick={() => navigate(`/tasks/${task._id}/project/${projectId}`)}>View Task</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Task;
