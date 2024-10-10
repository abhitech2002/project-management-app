import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTask, deleteTask, getTaskById, getTasksByProject, updateTask } from "../controllers/task.controller.js";

const router = Router()

router.route("/:id").post(verifyJWT, createTask)

router.route("/:projectId").get(verifyJWT, getTasksByProject)

router.route("/:taskId/project/:projectId")
.get(verifyJWT, getTaskById)
.put(verifyJWT, updateTask)
.delete(verifyJWT, deleteTask)

export default router