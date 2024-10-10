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
                setProject(response?.data?.data?.project);
                setProjectName(response?.data?.data?.project?.name);
                setDescription(response?.data?.data?.project?.description);
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
        return <p>Loading project details...</p>;
    }

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    return (
        <div className="project-details">
            <h2>Project Details</h2>

            {editMode ? (
                <form onSubmit={handleEdit}>
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                    <button type="submit">Save</button>
                    <button onClick={() => setEditMode(false)}>Cancel</button>
                </form>
            ) : (
                <>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <button onClick={() => setEditMode(true)}>Edit Project</button>
                    <button onClick={handleDelete}>Delete Project</button>
                </>
            )}

            <div>
                <h3>Collaborators</h3>
                <ul>
                    {project.collaborators.map((collaborator) => (
                        <li key={collaborator._id}>
                            {collaborator.name} ({collaborator.email})
                        </li>
                    ))}
                </ul>

                <form onSubmit={handleAddCollaborator}>
                    <input
                        type="email"
                        placeholder="Add collaborator by email"
                        value={collaboratorEmail}
                        onChange={(e) => setCollaboratorEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Add Collaborator</button>
                </form>
            </div>
        </div>
    );
};

export default ProjectDetails;
