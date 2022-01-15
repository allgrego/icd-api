/**
 * Version 1 routes design ("/v1/**")
 */
import {Router as expressRouter} from "express";
import diseasesRoutes from "./diseases";
import chaptersRoutes from "./chapters";
import blocksRoutes from "./blocks";

/**
 * All routes configuration
 */

const router = expressRouter();

// Middleware specific for all routes
router.use((req, res, next)=>{
  const baseUrl = `${req.protocol}://${req.hostname}`;
  const path = `${req.protocol}://${req.hostname}${req.baseUrl}`;
  const queryParams = req.query;
  // Not much for now
  console.log({
    path,
    baseUrl,
    queryParams});

  next();
});

// Index
router.get("/", (req, res) =>{
  const endpoints =[
    // Chapters
    "/chapters",
    "/chapters/:id",
    "/chapters/:id/blocks",
    "/chapters/q/label",
    // Blocks
    "/blocks",
    "/blocks/:id",
    "/blocks/:id/categories",
    "/blocks/q/code",
    "/blocks/q/label",
    "/diseases/search/code",
    "/diseases/search/name",
  ];

  res.json({
    app: "ICD-10 API",
    icd10Structure: "chapter (I)-> block (A00-A09) -> category (A00) -> subcategory (A00.9)",
    endpoints: endpoints.map((e)=>"/v1"+e),
  });
});

// Chapters
router.use("/chapters", chaptersRoutes);
// Blocks
router.use("/blocks", blocksRoutes);
// Diseases Routes
router.use("/diseases", diseasesRoutes);

// Fallback (404)
router.get("**", (req, res) =>{
  res.status(404).json({error: {code: "not-found", message: "Invalid route"}});
});

export default router;
