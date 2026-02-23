import mongoose, { Schema, type InferSchemaType } from "mongoose";

const TaskSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
      index: true,
    },

    // soft delete fields
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

// helpful compound index for list pages
TaskSchema.index({ ownerId: 1, createdAt: -1 });

export type TaskDoc = InferSchemaType<typeof TaskSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TaskModel = mongoose.model("Task", TaskSchema);
