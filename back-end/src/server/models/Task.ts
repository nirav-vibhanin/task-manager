import mongoose, { Schema, Document, Types } from 'mongoose';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface ITask extends Document {
  project: Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  status: TaskStatus;
}

const TaskSchema = new Schema<ITask>({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  title: { type: String, required: true, minlength: 3 },
  description: { type: String, maxlength: 500 },
  dueDate: { type: Date },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
}, { timestamps: true });

TaskSchema.index({ project: 1, title: 1 }, { unique: true });

export default mongoose.model<ITask>('Task', TaskSchema);
