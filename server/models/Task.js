import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    department: { type: String, required: true },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        "ongoing",
        "processing",
        "support",
        "review",
        "approved",
        "rejected",
      ],
      default: "ongoing",
    },
    beforeImage: { type: String },
    afterImage: { type: String },
    feedback: { type: String },
    position: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
