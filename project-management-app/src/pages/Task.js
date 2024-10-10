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
    return <p className="text-center">Loading tasks...</p>;
  }

  return (
    <div className="container mx-auto p-6">
    <h2 className="text-2xl font-bold mb-4">Tasks for Project</h2>
    {error && <p className="text-red-500">{error}</p>}

    <form onSubmit={handleCreateTask} className="mb-6 space-y-4">
      <input
        type="text"
        placeholder="Task Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="border border-gray-300 rounded p-2 w-full"
      />
      <div className="flex space-x-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="border border-gray-300 rounded p-2 w-full"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          className="border border-gray-300 rounded p-2 w-full"
        />
      </div>
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="border border-gray-300 rounded p-2 w-full"
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <button
        type="submit"
        className="bg-blue-500 text-white rounded p-2 w-full hover:bg-blue-600 transition duration-200"
      >
        Create Task
      </button>
    </form>

    <div>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks available</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task._id} className="border border-gray-200 rounded p-4">
              <h3 className="text-xl font-semibold">{task.name}</h3>
              <p>
                <strong>Start:</strong> {new Date(task.startDate).toLocaleDateString()}
              </p>
              <p>
                <strong>End:</strong> {new Date(task.endDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Priority:</strong> {task.priority}
              </p>
              <p>
                <strong>Status:</strong> {task.status}
              </p>
              <button
                onClick={() => navigate(`/tasks/${task._id}/project/${projectId}`)}
                className="mt-2 bg-green-500 text-white rounded p-2 hover:bg-green-600 transition duration-200"
              >
                View Task
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
  );
};

export default Task;
