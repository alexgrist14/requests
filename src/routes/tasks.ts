import { Router, Request, Response } from "express";
import { Op, WhereOptions } from "sequelize";
import Task from "../models/task";
import { TaskAttributes } from "../models/task";

const router = Router();

/**
 * @swagger
 * /tasks:
 *  post:
 *    summary: Create a new task.
 *    consumes:
 *      - application/json
 *    parameters:
 *      - in: body
 *        name: task
 *        description: The task to create.
 *        schema:
 *          type: object
 *          required:
 *            - topic
 *          properties:
 *            topic:
 *              type: string
 *            message:
 *              type: string
 *    responses:
 *      201:
 *        description: Created
 */
router.post("/", async (req, res) => {
  const { topic, message } = req.body;
  const task = await Task.create({ topic, message });
  res.status(201).json(task);
});

/**
 * @swagger
 * /tasks/{id}/start:
 *   patch:
 *     summary: Mark a task as "In progress"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket marked as "In progress"
 */
router.patch(
  "/:id/start",
  async (req: Request, res: Response): Promise<any> => {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).send("Not found");
    task.status = "In progress";
    await task.save();
    res.json(task);
  }
);

/**
 * @swagger
 * /tasks/{id}/complete:
 *   patch:
 *     summary: Complete a task and add a resolution message
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: body
 *         name: resolution
 *         schema:
 *           type: object
 *           required:
 *             - resolution
 *           properties:
 *             resolution:
 *               type: string
 *     responses:
 *       200:
 *         description: Ticket successfully completed
 */
router.patch(
  "/:id/complete",
  async (req: Request, res: Response): Promise<any> => {
    const { resolution } = req.body;
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).send("Not found");
    task.status = "Solved";
    task.resolution = resolution;
    await task.save();
    res.json(task);
  }
);

/**
 * @swagger
 * /tasks/{id}/cancel:
 *   patch:
 *     summary: Cancel a task with a cancellation reason
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: body
 *         name: reason
 *         schema:
 *           type: object
 *           required:
 *             - reason
 *           properties:
 *             reason:
 *               type: string
 *     responses:
 *       200:
 *         description: Ticket successfully canceled
 */
router.patch(
  "/:id/cancel",
  async (req: Request, res: Response): Promise<any> => {
    const { reason } = req.body;
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).send("Not found");
    task.status = "Cancelled";
    task.cancellationReason = reason;
    await task.save();
    res.json(task);
  }
);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get list of tasks (optionally filter by date or date range)
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Exact date filter (e.g., 2025-04-15)
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start of date range
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End of date range
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get("/", async (req: Request, res: Response) => {
  const { date, from, to } = req.query;
  const where: WhereOptions<TaskAttributes> = {};

  if (date) {
    const dayStart = new Date(date + "T00:00:00");
    const dayEnd = new Date(date + "T23:59:59");
    where.createdAt = {
      [Op.between]: [dayStart, dayEnd],
    };
  }

  if (from && to) {
    where.createdAt = {
      [Op.between]: [new Date(from + "T00:00:00"), new Date(to + "T23:59:59")],
    };
  }

  const tasks = await Task.findAll({ where });
  res.json(tasks);
});

/**
 * @swagger
 * /tasks/cancel/in-progress/all:
 *   patch:
 *     summary: Cancel all tasks that are currently "In progress"
 *     responses:
 *       200:
 *         description: All "In progress" tasks have been canceled
 */
router.patch("/cancel/in-progress/all", async (req: Request, res: Response) => {
  const updated = await Task.update(
    { status: "Cancelled", cancellationReason: "Cancelled automatically" },
    { where: { status: "In progress" } }
  );
  res.json({ updated: updated[0] });
});

export default router;
