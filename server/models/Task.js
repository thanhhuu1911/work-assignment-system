// models/Task.js
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
        "review",
        "approved",
        "rejected",
        "overdue",
        "needs_improvement",
      ],
      default: "ongoing",
    },
    beforeImage: { type: String },
    afterImage: { type: String },
    position: { type: String, required: true },

    // GÓP Ý TỪ DUYỆT
    reviewNote: { type: String, default: null },
    reviewedAt: { type: Date },
    improveNote: {
      type: String,
      default: null,
    },
    attachedFiles: [
      {
        original: String,
        stored: String,
      },
    ],
    completedFiles: [
      {
        original: String,
        stored: String,
      },
    ],
  },
  { timestamps: true }
);

// VIRTUAL: TỰ ĐỘNG TÍNH QUÁ HẠN
taskSchema.virtual("isOverdue").get(function () {
  if (!["ongoing", "processing", "review"].includes(this.status)) return false; // ĐÃ SỬA
  const now = new Date();
  const due = new Date(this.dueDate);
  const endOfDay = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate(),
    23,
    59,
    59
  );
  return now > endOfDay;
});

taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });
taskSchema.index({ dueDate: 1, status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ assignedBy: 1 });
export default mongoose.model("Task", taskSchema);
