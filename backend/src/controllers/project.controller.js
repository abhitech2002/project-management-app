import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.models.js";
import { User } from "../models/user.models.js";
import { Task } from "../models/task.models.js";

const projectCreate = asyncHandler(async (req, res) => {
  const { name, description, collaborators } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Project name or description required");
  }

  const projectExist = await Project.findOne({
    $or: [{ name }, { description }],
  });

  if (projectExist) {
    throw new ApiError(409, "Project with name or description already exists");
  }

  const project = await Project.create({
    name,
    description,
    owner: req.user._id,
    collaborators: collaborators || [],
  });

  const createdProject = await Project.findById(project._id);

  if (!createdProject) {
    throw new ApiError(500, "Something went wrong while creating project");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, createdProject, "Project created successfully.")
    );
});

const getProjects = asyncHandler(async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
    })
      .populate("collaborators", "fullName email")
      .populate("owner", "fullName");

    if (!projects || projects.length === 0) {
      return next(new ApiError(404, "No projects found"));
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, { projects }, "Projects retrieved successfully")
      );
  } catch (error) {
    return next(
      new ApiError(500, "Something went wrong while fetching projects")
    );
  }
});

const getProjectById = asyncHandler(async (req, res, next) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findOne({
      _id: projectId,
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
    })
      .populate("tasks")
      .populate("collaborators", "fullName email")
      .populate("owner", "fullName");

    if (!project) {
      return next(new ApiError(404, "Project not found or access denied"));
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, { project }, "Project retrieved successfully")
      );
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "Something went wrong while fetching the project")
    );
  }
});

const updateProject = asyncHandler(async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const projectId = req.params.id;

    const project = await Project.findOneAndUpdate(
      { _id: projectId, owner: req.user._id },
      { name, description },
      { new: true }
    );

    if (!project) {
      return next(
        new ApiError(404, "Project not found or you're not the owner")
      );
    }

    res
      .status(200)
      .json(new ApiResponse(200, { project }, "Project updated successfully"));
  } catch (error) {
    return next(
      new ApiError(500, "Something went wrong while updating the project")
    );
  }
});

const deleteProject = asyncHandler(async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user._id;

    const project = await Project.findById(projectId);

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    if (project.owner.toString() !== userId.toString()) {
      throw new ApiError(403, "You're not authorized to delete this project");
    }

    const deletedProject = await Project.findOneAndDelete({
      _id: projectId,
      owner: userId,
    });

    if (!deletedProject) {
      throw new ApiError(500, "Failed to delete the project");
    }

    const deletedTasksCount = await Task.deleteMany({ project: projectId });
    console.log(`Deleted ${deletedTasksCount.deletedCount} tasks`);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Project and associated tasks deleted successfully"
        )
      );
  } catch (error) {
    console.error("Error deleting project:", error.stack);
    next(error);
  }
});

const addCollaborator = asyncHandler(async (req, res, next) => {
  try {
    const { collaboratorEmail } = req.body;

    const projectId = req.params.id;

    const project = await Project.findById(projectId);

    if (project.owner.toString() !== req.user._id.toString()) {
      return next(
        new ApiError(403, "You are not authorized to add collaborators")
      );
    }

    const collaborator = await User.findOne({ email: collaboratorEmail });

    if (!collaborator) {
      return next(new ApiError(404, "User with this email not found"));
    }

    if (project.collaborators.includes(collaborator._id)) {
      return next(new ApiError(400, "User is already a collaborator"));
    }

    project.collaborators.push(collaborator._id);

    await project.save();

    res
      .status(200)
      .json(
        new ApiResponse(200, { project }, "Collaborator added successfully")
      );
  } catch (error) {
    console.log(error);

    return next(
      new ApiError(500, "Something went wrong while adding a collaborator")
    );
  }
});

export {
  projectCreate,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addCollaborator,
};
