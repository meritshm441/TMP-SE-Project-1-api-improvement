import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db/connectDB.js";
import { NODE_ENV, PORT } from "./constant/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://tmp-se-project.azurewebsites.net",
];

app.use(
  cors({
    origin: allowedOrigins, // Allow specific origins
    credentials: true, // Allow cookies if needed
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
  })
);

app.use(cookieParser());

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT} on ${NODE_ENV} environment`);
  await connectDB();
});
