import { Router } from "express";
import { addCollaborator, deleteProject, getProjectById, getProjects, projectCreate, updateProject } from "../controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

// auth routes
router.route("/").post(verifyJWT, projectCreate)

router.route("/").get(verifyJWT, getProjects)

router.route("/:id/add").post(verifyJWT, addCollaborator)

router.route('/:id').get(verifyJWT, getProjectById)

router.route('/:id').put(verifyJWT, updateProject)

router.route('/:id').get(verifyJWT, deleteProject)

export default router