import {Router as expressRouter} from "express";
// Routes
import v1Routes from "./v1";

/**
 * All routes configuration
 */

const router = expressRouter();

// Middleware specific for all routes
router.use((req, res, next)=>{
  // Set content-type to json
  res.setHeader("Content-Type", "application/json");
  next();
});

// Index
router.get("/", (req, res) =>{
  res.json({
    app: "ICD-10 API",
    icd10Structure: "chapter (I)-> block (A00-A09) -> category (A00) -> subcategory (A00.0)",
    currentVersion: "v1",
  });
});
// Version 1 Routes
router.use("/v1", v1Routes);

// Fallback (404)
router.get("**", (req, res) =>{
  res.status(404).json({error: {code: "not-found", message: "Invalid route"}});
});

export default router;
