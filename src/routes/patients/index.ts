/**
 * All routes with the pattern "/patients/**"
 */
import {Router as expressRouter} from "express";

const router = expressRouter();

// Middleware specific for these routes
router.use((req, res, next)=>{
  // Not doing much for now
  console.log("patients routes");
  next();
});

// Retrieves all patients
router.get("/", (req, res) => res.json({
  message: "*Displays all users*",
}));
// Retrieves one patient with given ID
router.get("/:pid", (req, res) => {
  // Patient ID from route parameters
  const pid = req.params.pid;

  res.json({
    message: `*Displays patient with ID: ${pid}*`,
  });
});

export default router;
