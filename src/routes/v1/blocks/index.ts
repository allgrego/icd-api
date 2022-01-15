/**
 * Routes for blocks (/v1/blocks/**)
 * @author: Gregorio Alvarez <allgrego14@gmail.com>
 */

import {Router as expressRouter} from "express";
import {paginateData} from "../../../functions/datahandler";
import {resError} from "../../../functions/express";
import {getAllBlocks, getAllCategories, getBlock} from "../../../functions/icd10";

const router = expressRouter();

// Middleware specific for these routes
router.use((req, res, next)=>{
  // Not much for now
  next();
});

// Retrieves all blocks
router.get("/", async (req, res)=>{
  // Current page (NaN if not number)
  const page = Number(req.query.page);
  // Default number of elements per page
  const DEFAULT_COUNT = 10;
  // Elements per page (DEFAULT_COUNT if not number)
  const count = Number(req.query.count)||DEFAULT_COUNT;

  try {
    // Retrieve ALL blocks
    const blocks = await getAllBlocks();
    // If no blocks are found, it's because an internal error
    if (!blocks) throw new Error("No blocks were found");
    // Paginate data and get pagination parameters
    const data = paginateData(blocks, page, count);
    res.json(data);
    return;
  } catch (error: any) {
    console.log("[ERROR]: "+error.message);
    resError(res, 500, "internal", "Something wrong happened! "+error.message);
    return;
  }
});

// Retrieve a single block for a given ID
router.get("/:blockId", async (req, res)=>{
  const {blockId} = req.params;
  try {
    const block = await getBlock(blockId);
    if (!block) {
      resError(res, 404, "not-found", "No block were found for given ID");
      return;
    }
    const categories = await getAllCategories(block.id);
    const data = {...block, totalCategories: categories?.length||0};
    res.json(data);
    return;
  } catch (error: any) {
    console.log("[ERROR]: "+error.message);
    resError(res, 500, "internal", "Something wrong happened! "+error.message);
    return;
  }
});

export default router;

