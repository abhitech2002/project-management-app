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
    <div className="task-detail">
      <h2>Task Detail</h2>

      {task && (
        <div>
          {isEditing ? (
            <form onSubmit={handleUpdateTask}>
              <input
                type="text"
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
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
              <button type="submit">Save Task</button>
            </form>
          ) : (
            <div>
              <h3>{task.name}</h3>
              <p>
                Start Date: {new Date(task.startDate).toLocaleDateString()}
              </p>
              <p>
                End Date: {new Date(task.endDate).toLocaleDateString()}
              </p>
              <p>Priority: {task.priority}</p>
              <p>Status: {task.status}</p>
              <button onClick={() => setIsEditing(true)}>Edit Task</button>
              <button onClick={handleDeleteTask} style={{ color: "red" }}>
                Delete Task
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
