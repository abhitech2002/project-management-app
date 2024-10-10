import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TaskDetail = () => {
  const { taskId, projectId } = useParams(); 
  const [task, setTask] = useState(null);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("Low");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  // Fetch the task by its ID
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(
          `http://localhost:8000/api/v1/tasks/${taskId}/project/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const taskData = response.data.data.task;
        setTask(taskData);
        setName(taskData.name);
        setStartDate(taskData.startDate.slice(0, 10));
        setEndDate(taskData.endDate.slice(0, 10));
        setPriority(taskData.priority);
        setStatus(taskData.status);
        setLoading(false);
      } catch (error) {
        setError("Failed to load task");
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, projectId]);

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    try {
      const accessToken = localStorage.getItem("accessToken");

      const updatedTask = {
        name,
        startDate,
        endDate,
        priority,
        status,
      };

      await axios.put(
        `http://localhost:8000/api/v1/tasks/${taskId}/project/${projectId}`,
        updatedTask,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setIsEditing(false); // Turn off editing mode after saving
    } catch (error) {
      setError("Failed to update the task");
    }
  };

  const handleDeleteTask = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      await axios.delete(
        `http://localhost:8000/api/v1/tasks/${taskId}/project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      navigate(`/projects/${projectId}/tasks`); 
    } catch (error) {
      setError("Failed to delete the task");
    }
  };

  if (loading) {
    return <p>Loading task details...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
<div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Task Detail</h2>

      {task && (
        <div className="bg-white shadow-md rounded-lg p-6">
          {isEditing ? (
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border border-gray-300 p-2 rounded w-full"
                placeholder="Task Name"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="border border-gray-300 p-2 rounded w-full"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="border border-gray-300 p-2 rounded w-full"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
              <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                Save Task
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 text-white p-2 rounded">
                Cancel
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{task.name}</h3>
              <p>
                <span className="font-bold">Start Date:</span> {new Date(task.startDate).toLocaleDateString()}
              </p>
              <p>
                <span className="font-bold">End Date:</span> {new Date(task.endDate).toLocaleDateString()}
              </p>
              <p>
                <span className="font-bold">Priority:</span> {task.priority}
              </p>
              <p>
                <span className="font-bold">Status:</span> {task.status}
              </p>
              <div className="flex space-x-2">
                <button onClick={() => setIsEditing(true)} className="bg-green-500 text-white p-2 rounded">
                  Edit Task
                </button>
                <button onClick={handleDeleteTask} className="bg-red-500 text-white p-2 rounded">
                  Delete Task
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
