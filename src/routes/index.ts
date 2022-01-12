import {Router as expressRouter} from "express";
// Routes
import usersRoutes from "./users";
import patientsRoutes from "./patients";

/**
 * All routes configuration
 */

const router = expressRouter();

// Middleware specific for all routes
router.use((req, res, next)=>{
  // Not much for now
  console.log("users routes");
  next();
});

// Index
router.get("/", (req, res) =>{
  const name = req.query.name??"World";
  res.json({
    message: `Hello, ${name}!`,
    exampleEndpoints: [
      "/users/",
      "/users/:userId",
      "/patients/",
      "/patients/:patientId",
    ],
  });
});
// Users Routes
router.use("/users", usersRoutes);
// Patients Routes
router.use("/patients", patientsRoutes);
// Login
router.get("/login", (req, res) =>{
  res.json({message: "Attempt to login"});
});
// Dashboard
router.get("/dashboard", (req, res) =>{
  res.json({message: "Display dashboard"});
});

// Fallback (404)
router.get("**", (req, res) =>{
  res.status(404).json({error: {code: "not-found", message: "Invalid route"}});
});

export default router;
