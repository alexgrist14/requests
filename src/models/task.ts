import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db";

export interface TaskAttributes {
  id: number;
  topic: string;
  message: string;
  status: TaskStatus;
  resolution?: string;
  cancellationReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type TaskStatus = "New" | "In progress" | "Solved" | "Cancelled";

type TaskCreationAttributes = Optional<
  TaskAttributes,
  | "id"
  | "status"
  | "resolution"
  | "cancellationReason"
  | "createdAt"
  | "updatedAt"
>;

export class Task
  extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes
{
  public id!: number;
  public topic!: string;
  public message!: string;
  public status!: TaskStatus;
  public resolution?: string;
  public cancellationReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("New", "In progress", "Solved", "Cancelled"),
      defaultValue: "New",
    },
    resolution: {
      type: DataTypes.TEXT,
    },
    cancellationReason: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    tableName: "tasks",
    timestamps: true,
  }
);

export default Task;
