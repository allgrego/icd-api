/**
 * All routes with the pattern "/users/**"
 */
import {Router as expressRouter} from "express";

const router = expressRouter();

// Middleware specific for these routes
router.use((req, res, next)=>{
  // Not much for now
  console.log("users routes");
  next();
});

// Retrieves all users
router.get("/", (req, res) => res.json({
  message: "*Displays all users*",
}));

// Retrieves one user with given ID
router.get("/:id", (req, res) => {
  // User ID from route parameters
  const uid = req.params.id;

  res.json({
    message: `*Displays user with ID: ${uid}*`,
  });
});

export default router;
