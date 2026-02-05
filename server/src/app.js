import express from "express";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import appRoutes from "./routes/app.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser())

app.use("/api/auth", authRoutes);
app.use('/app', appRoutes);

app.use(errorHandler);

export default app;