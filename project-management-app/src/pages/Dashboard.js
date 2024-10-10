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
        return <p className="text-center text-gray-500">Loading projects...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }


    return (
<div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-semibold text-center mb-6">Your Projects</h2>

            <div className="text-center mb-4">
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                >
                    {isCreating ? "Cancel" : "Create Project"}
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreateProject} className="mb-6 bg-white p-4 rounded shadow-md">
                    <input
                        type="text"
                        placeholder="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                        className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                        placeholder="Project Description"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        required
                        className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-200"
                    >
                        Create Project
                    </button>
                </form>
            )}

            <div>
                {projects.length === 0 ? (
                    <p className="text-center text-gray-500">No projects available</p>
                ) : (
                    <ul className="space-y-4">
                        {projects.map((project) => (
                            <li key={project._id} className="bg-white p-4 rounded shadow-md">
                                <h3 className="text-xl font-semibold">{project.name}</h3>
                                <p className="text-gray-700">{project.description}</p>
                                <div className="mt-4 flex justify-between">
                                    <button
                                        onClick={() => navigate(`/projects/${project._id}/tasks`)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                                    >
                                        View Project Tasks
                                    </button>
                                    <button
                                        onClick={() => navigate(`/projects/${project._id}`)}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition duration-200"
                                    >
                                        View Project
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
