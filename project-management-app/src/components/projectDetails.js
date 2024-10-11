import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [collaboratorEmail, setCollaboratorEmail] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");

    // New state variables for owner, created date, and task count
    const [createdAt, setCreatedAt] = useState("");
    const [taskCount, setTaskCount] = useState(0);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                const response = await axios.get(
                    `http://localhost:8000/api/v1/projects/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                const projectData = response?.data?.data?.project;
                console.log("Project data:", projectData); 

                setProject(projectData);
                setProjectName(projectData?.name);
                setDescription(projectData?.description);

                setCreatedAt(new Date(projectData?.createdAt).toLocaleDateString());
                setTaskCount(projectData?.tasks?.length || 0);
                setLoading(false);
            } catch (error) {
                setError("Failed to load project details");
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [id]);


    const handleDelete = async () => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            await axios.delete(`http://localhost:8000/api/v1/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            navigate("/dashboard");
        } catch (error) {
            setError("Failed to delete the project");
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const accessToken = localStorage.getItem("accessToken");

            await axios.put(
                `http://localhost:8000/api/v1/projects/${id}`,
                {
                    name: projectName,
                    description: description,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setEditMode(false);
        } catch (error) {
            setError("Failed to update the project");
        }
    };

    const handleAddCollaborator = async (e) => {
        e.preventDefault();
        try {
            const accessToken = localStorage.getItem("accessToken");

            await axios.post(
                `http://localhost:8000/api/v1/projects/${id}/add`,
                { collaboratorEmail },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setCollaboratorEmail("");
            setError(null);
        } catch (error) {
            setError("Failed to add collaborator");
        }
    };

    if (loading) {
        return <p className="text-gray-500">Loading project details...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Project Details</h2>

            {editMode ? (
                <form onSubmit={handleEdit} className="mb-4">
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                        className="w-full p-2 mb-4 border border-gray-300 rounded"
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full p-2 mb-4 border border-gray-300 rounded"
                        rows="4"
                    />
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditMode(false)}
                            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                    <p className="mb-4">{project.description}</p>
                    <p className="mb-2">Owner: {project.owner}</p>
                    <p className="mb-2">Created At: {createdAt}</p>
                    <p className="mb-2">Number of Tasks: {taskCount}</p>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setEditMode(true)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                        >
                            Edit Project
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                            Delete Project
                        </button>
                    </div>
                </>
            )}

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-2">Collaborators</h3>
                {project?.collaborators && project.collaborators.length > 0 ? (
                    <ul className="mb-4">
                    {project.collaborators
                      .filter((collaborator, index, self) =>
                        index === self.findIndex((c) => c._id === collaborator._id)
                      )
                      .map((collaborator) => (
                        <li key={collaborator._id} className="mb-2">
                          {collaborator.fullName} ({collaborator.email})
                        </li>
                      ))}
                  </ul>
                  
                ) : (
                    <p>No collaborators found for this project.</p>
                )}
            </div>


            <form onSubmit={handleAddCollaborator} className="flex space-x-4">
                <input
                    type="email"
                    placeholder="Add collaborator by email"
                    value={collaboratorEmail}
                    onChange={(e) => setCollaboratorEmail(e.target.value)}
                    required
                    className="flex-1 p-2 border border-gray-300 rounded"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                    Add Collaborator
                </button>
            </form>
        </div>
    );
};

export default ProjectDetails;
