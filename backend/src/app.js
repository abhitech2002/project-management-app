import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import './utils/taskExpiryChecker.js'

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser())

// Routes import
import userRouter from './routes/user.routes.js'
import projectRouter from './routes/project.routes.js'
import taskRouter from './routes/task.routes.js'

// routes declaration
app.use('/api/v1/users', userRouter)
app.use('/api/v1/projects', projectRouter)
app.use('/api/v1/tasks', taskRouter)

export default app;
