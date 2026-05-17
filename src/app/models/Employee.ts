/**
 * Employee Mongoose model.
 *
 * Represents a staff member — either an owner (full access) or an employee
 * (can only see and action their own assigned orders).
 *
 * NOTE: Passwords are stored as plain strings to match the existing mock data.
 * Replace with bcrypt hashing before going to production.
 */

import mongoose, { Schema, type Document } from "mongoose";
import type { TEmployee, UserRole } from "./types";

export interface IEmployee
  extends Omit<TEmployee, "id" | "createdAt" | "updatedAt">, Document {
  id: string;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["owner", "employee"] satisfies UserRole[],
      required: true,
      default: "employee",
    },
    // TODO: hash with bcrypt before production
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // Strip password whenever .toJSON() is called (e.g. res.json())
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

const Employee =
  (mongoose.models.Employee as mongoose.Model<IEmployee>) ||
  mongoose.model<IEmployee>("Employee", EmployeeSchema);

export default Employee;
