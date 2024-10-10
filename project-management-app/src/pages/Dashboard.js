import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                const response = await axios.get(
                    "http://localhost:8000/api/v1/projects/",
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                const projectData = response?.data?.data?.projects || [];
                setProjects(projectData);
                setLoading(false);
            } catch (error) {
                setError("Failed to load projects");
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const accessToken = localStorage.getItem("accessToken");
            const response = await axios.post(
                "http://localhost:8000/api/v1/projects/",
                {
                    name: projectName,
                    description: projectDescription,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setProjects((prevProjects) => [
                ...prevProjects,
                response.data.data.project,
            ]);
            setProjectName("");
            setProjectDescription("");
            setIsCreating(false); 
        } catch (error) {
            setError("Failed to create project");
        }
    };

    if (loading) {
        return <p>Loading projects...</p>;
    }

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    return (
        <div className="project-container">
            <h2>Your Projects</h2>

            <button onClick={() => setIsCreating(!isCreating)}>
                {isCreating ? "Cancel" : "Create Project"}
            </button>

            {isCreating && (
                <form onSubmit={handleCreateProject} style={{ marginBottom: "20px" }}>
                    <input
                        type="text"
                        placeholder="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Project Description"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        required
                    />
                    <button type="submit">Create Project</button>
                </form>
            )}

            <div>
                {projects.length === 0 ? (
                    <p>No projects available</p>
                ) : (
                    <ul className="project-list">
                        {projects.map((project) => (
                            <li key={project._id}>
                                <h3>{project.name}</h3>
                                <p>{project.description}</p>
                                <button onClick={() => navigate(`/projects/${project._id}/tasks`)}>
                                    View Project Tasks
                                </button>
                                <button onClick={() => navigate(`/projects/${project._id}`)}>
                                    View Project
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
