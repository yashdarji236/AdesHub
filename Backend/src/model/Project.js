import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    projectCategory: {
      type: String,
      required: true,
      enum: ['Poster Ad', 'Meme Ad', 'Brand Ad'],
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', ProjectSchema);

export default Project;
