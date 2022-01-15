import express from "express";
import routes from "./routes";


const app = express();

/**
 * Routes
 * To configure routes go to /routes directory
 */

// All Routes
app.use("/", routes);

export const serverApp = app;
