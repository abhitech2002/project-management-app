import mongoose, { Schema } from "mongoose";

const TaskSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High'], 
        default: 'Low' 
    },
    completed: { 
        type: Boolean, 
        default: false 
    },
    project: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    },
}, {timestamps: true})

export const Task = mongoose.model("Task", TaskSchema);
