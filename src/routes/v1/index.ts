/**
 * Version 1 routes design ("/v1/**")
 */
import {Router as expressRouter} from "express";
import diseasesRoutes from "./diseases";
import chaptersRoutes from "./chapters";
import blocksRoutes from "./blocks";
import categoriesRoutes from "./categories";
import {stdRouteNotFound} from "../../functions/express";

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
  const endpoints ={
    // Chapters
    chapters: [
      "/chapters",
      "/chapters/:id",
      "/chapters/:id/blocks",
      "/chapters/search/label/:label",
    ],
    // Blocks
    blocks: [
      "/blocks",
      "/blocks/:id",
      "/blocks/:id/categories",
      "/blocks/search/id/:id",
      "/blocks/search/label/:label",
    ],
    // Categories
    categories: [
      "/categories",
      "/categories/:id",
      "/categories/:id/subcategories",
      "/categories/search/id/:id",
      "/categories/search/label/:label",
    ],
    subcategories: [
      "not yet...",
    ],

    // "/diseases/search/code",
    // "/diseases/search/name",
  };

  res.json({
    app: "ICD-10 API",
    icd10Structure: "chapter (I)-> block (A00-A09) -> category (A00) -> subcategory (A00.9)",
    endpoints: endpoints,
  });
});

// Chapters Routes
router.use("/chapters", chaptersRoutes);
// Blocks Routes
router.use("/blocks", blocksRoutes);
// Categories Routes
router.use("/categories", categoriesRoutes);
// Diseases Routes
router.use("/diseases", diseasesRoutes);

// Fallback (404)
router.get("**", (req, res) =>stdRouteNotFound(res));

export default router;
