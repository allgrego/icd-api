import express from "express";
import routes from "./routes";
// Environment variables configuration and loader
import {env} from "./config";

const app = express();

/**
 * Routes
 * To configure routes go to /routes directory
 */

// All Routes
app.use("/", routes);

app.listen(env.PORT??3000, ()=>{
  console.log("\x1b[33m[EXPRESS-SERVER] %s\x1b[0m", "Starting server...");
  console.log("\x1b[33m[EXPRESS-SERVER] %s\x1b[0m \x1b[36m%s\x1b[0m ", "Listening on port:", `${env.PORT??3000}`);
});
