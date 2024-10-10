import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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

                const projectData = response?.data?.data?.projects;

                if (projectData) {
                    setProjects(projectData); 
                } else {
                    setProjects([]);
                }

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

            const newProject = {
                name: projectName,
                description: description,
            };

            await axios.post("http://localhost:8000/api/v1/projects", newProject, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setProjectName("");
            setDescription("");

            window.location.reload();
        } catch (error) {
            setError("Failed to create a project");
        }
    };

    if (loading) {
        return <p>Loading projects...</p>;
    }

    return (
        <div className="project-container">
            <h2>Your Projects</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleCreateProject}>
                <input
                    type="text"
                    placeholder="Project Name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Project Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <button type="submit">Create Project</button>
            </form>

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
