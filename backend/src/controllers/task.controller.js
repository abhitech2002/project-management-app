import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Task } from "../models/task.models.js"
import { Project } from "../models/project.models.js";

const createTask = asyncHandler(async (req, res, next) => {
    try {
        const { name, startDate, endDate, priority } = req.body;

        const projectId = req.params.id;

        if (!name || !startDate || !endDate || !priority) {
            return next(new ApiError(400, "Task name, start date, end date, and priority are required"));
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return next(new ApiError(404, "Project not found"));
        }

        const isOwner = project.owner.toString() === req.user._id.toString();
        const isCollaborator = project.collaborators.includes(req.user._id);

        if (!isOwner && !isCollaborator) {
            return next(new ApiError(403, "You are not authorized to add tasks to this project"));
        }

        const task = new Task({
            name,
            startDate,
            endDate,
            priority,
            status: 'pending',
            project: projectId,
            creator: req.user._id
        });

        await task.save();

        project.tasks.push(task._id);

        await project.save();

        res.status(201).json(new ApiResponse(201, { task }, "Task created successfully"));

    } catch (error) {
        return next(new ApiError(500, "Something went wrong while creating the task"));
    }
})

const getTasksByProject = asyncHandler(async (req, res, next) => {
    try {
        const tasks = await Task.find({ project: req.params.projectId }).populate('project');

        if (!tasks) {
            return next(new ApiError(404, "No tasks found for this project"));
        }

        res.status(200).json(new ApiResponse(200, { tasks }, "Tasks retrieved successfully"));
    } catch (error) {
        return next(new ApiError(500, "Something went wrong while fetching tasks"));
    }
});

const getTaskById = asyncHandler(async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.taskId, project: req.params.projectId });

        if (!task) {
            return next(new ApiError(404, "Task not found"));
        }

        res.status(200).json(new ApiResponse(200, { task }, "Task retrieved successfully"));
    } catch (error) {
        return next(new ApiError(500, "Something went wrong while fetching the task"));
    }
});

const updateTask = asyncHandler(async (req, res, next) => {
    try {
        const { name, startDate, endDate, priority, status } = req.body;

        const isOwner = project.owner.toString() === req.user._id.toString();
        const isCreator = task.creator.toString() === req.user._id.toString();

        if (!isOwner && !isCreator) {
            return next(new ApiError(403, "You are not authorized to update this task"));
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.taskId, project: req.params.projectId },
            { name, startDate, endDate, priority, status },
            { new: true }
        );

        if (!task) {
            return next(new ApiError(404, "Task not found"));
        }

        res.status(200).json(new ApiResponse(200, { task }, "Task updated successfully"));
    } catch (error) {
        return next(new ApiError(500, "Something went wrong while updating the task"));
    }
});

const deleteTask = asyncHandler(async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.taskId, project: req.params.projectId });

        if (!task) {
            return next(new ApiError(404, "Task not found"));
        }

        const isOwner = project.owner.toString() === req.user._id.toString();
        const isCreator = task.creator.toString() === req.user._id.toString();

        if (!isOwner && !isCreator) {
            return next(new ApiError(403, "You are not authorized to delete this task"));
        }

        res.status(200).json(new ApiResponse(200, {}, "Task deleted successfully"));
    } catch (error) {
        return next(new ApiError(500, "Something went wrong while deleting the task"));
    }
});



export {
    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    deleteTask
}