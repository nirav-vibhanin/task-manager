import mongoose, { Schema, Document, Types } from 'mongoose';

export type ProjectStatus = 'Pending' | 'In Progress' | 'Completed';

export interface IProject extends Document {
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  status: ProjectStatus;
  createdBy: Types.ObjectId;
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true, minlength: 3 },
  description: { type: String, maxlength: 1000 },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

ProjectSchema.pre('save', function (next) {
  if (this.endDate && this.endDate < this.startDate) {
    return next(new Error('End date must be greater than or equal to Start date'));
  }
  next();
});

export default mongoose.model<IProject>('Project', ProjectSchema);
