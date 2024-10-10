import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.models.js";
import { User } from "../models/user.models.js";

const projectCreate = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

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
    // collaborators: collaborators || []
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
    const projects = await Project.find({ owner: req.user._id }).populate(
      "collaborators",
      "name email"
    );

    if (!projects) {
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
      owner: req.user._id,
    });

    if (!project) {
      return next(new ApiError(404, "Project not found"));
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

    const project = await Project.findOneAndDelete({
      _id: projectId,
      owner: req.user._id,
    });

    if (!project) {
      return next(
        new ApiError(404, "Project not found or you're not the owner")
      );
    }

    await Task.deleteMany({ project: projectId });

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Project deleted successfully"));
  } catch (error) {
    return next(
      new ApiError(500, "Something went wrong while deleting the project")
    );
  }
});

export {
  projectCreate,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
