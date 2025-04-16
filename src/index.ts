import express from "express";
import sequelize from "./db";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();

app.use(express.json());

const swaggerOptions = {
  swaggerDefinition: {
    myapi: "3.0.0",
    info: {
      title: "Task Tracker",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
import taskRoutes from "./routes/tasks";

app.use("/tasks", taskRoutes);

const start = async () => {
  await sequelize.sync();
  app.listen(3000, () => console.log("Start listening on http://localhost:3000"));
};

start();
