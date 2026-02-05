import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },

  options: [String],

  answer: {
    type: String,
    required: true,
  },
});

const attemptSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  answer: [String],

  score: Number,

  completedAt: {
    type: Date,
    default: Date.now,
  },
});

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    questions: [questionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    attempts: [attemptSchema],
  },
  { timestamps: true },
);

export const testModel = mongoose.model("Test", testSchema);
