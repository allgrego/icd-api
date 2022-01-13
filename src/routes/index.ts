import {Router as expressRouter} from "express";
// Routes
import diseasesRoutes from "./diseases";

/**
 * All routes configuration
 */

const router = expressRouter();

// Middleware specific for all routes
router.use((req, res, next)=>{
  // Not much for now
  next();
});

// Index
router.get("/", (req, res) =>{
  const name = req.query.name??"World";
  res.json({
    message: `Hello, ${name}!`,
    exampleEndpoints: [
      "/diseases/code/:code",
      "/diseases/search/code",
      "/diseases/search/name",
    ],
  });
});
// Users Routes
router.use("/diseases", diseasesRoutes);

// Fallback (404)
router.get("**", (req, res) =>{
  res.status(404).json({error: {code: "not-found", message: "Invalid route"}});
});

export default router;
