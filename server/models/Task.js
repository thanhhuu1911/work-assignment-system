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
        "pending",
        "processing",
        "support",
        "review",
        "approved",
        "rejected",
      ],
      default: "pending",
    },
    beforeImage: { type: String },
    afterImage: { type: String },
    feedback: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
