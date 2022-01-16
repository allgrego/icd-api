/**
 * Routes for blocks (/v1/blocks/**)
 * @author: Gregorio Alvarez <allgrego14@gmail.com>
 */

import {Router as expressRouter} from "express";
import {paginateData, sortData} from "../../../functions/datahandler";
import {getRequestPaginationParameters, getRequestSortParameters, resError, stdRouteNotFound} from "../../../functions/express";
import {getAllBlocks, getAllCategories, getBlock, getChapter, queryBlocksByKey} from "../../../functions/icd10";

const router = expressRouter();

// Middleware specific for these routes
router.use((req, res, next)=>{
  // Not much for now
  next();
});

// Retrieves all blocks
router.get("/", async (req, res)=>{
  const DEFAULT_COUNT = 10;

  try {
    // Retrieve ALL blocks
    const blocks = await getAllBlocks();
    // If no blocks are found, it's because an internal error
    if (!blocks) throw new Error("No blocks were found");
    // Sort blocks
    const sortParams = getRequestSortParameters(req, blocks, "id");
    const sortedBlocks = sortData(sortParams);
    // Get pagination parameters from request
    const {page, count} = getRequestPaginationParameters(req, DEFAULT_COUNT);
    // Paginate data and get pagination parameters
    const data = paginateData(sortedBlocks, page, count);
    res.status(200).json(data);
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
    const chapter = await getChapter(block.chapterId);
    const categories = await getAllCategories(block.id);
    // JSON data to send
    const data = {
      ...block,
      chapterId: chapter?.id,
      chapterLabel: chapter?.label,
      totalCategories: categories?.length,
    };
    res.status(200).json(data);
    return;
  } catch (error: any) {
    console.log("[ERROR]: "+error.message);
    resError(res, 500, "internal", "Something wrong happened! "+error.message);
    return;
  }
});

// Retrieve all categories of a block for a given ID
router.get("/:blockId/categories", async (req, res)=>{
  // Block ID to find its categories
  const {blockId} = req.params;
  try {
    // Retrieve block by ID
    const block = await getBlock(blockId);
    if (!block) {
      resError(res, 404, "not-found", "No block were found for given ID");
      return;
    }
    // Retrieve Chapter for selected block
    const chapter = await getChapter(block.chapterId);

    // Retrieve categories of selected block
    const categories = await getAllCategories(block.id);
    if (!categories) {
      throw new Error("There was an error retrieving categories for block "+block.id);
    }
    // Remove blockId field from categories
    const processedCategories : any[] = categories.map((c)=>{
      return {id: c.id, label: c.label};
    });
    // Sort Categories by ID
    const sortParams = getRequestSortParameters(req, processedCategories, "id");
    const sortedCategories = sortData(sortParams);
    // Default number of elements per page
    const DEFAULT_COUNT = 10;
    // Get pagination parameters from request
    const {page, count} = getRequestPaginationParameters(req, DEFAULT_COUNT);
    // Paginate Sorted data (sorted by id)
    const data = paginateData(sortedCategories, page, count);
    // Data of categories parents (Block and Chapter)
    const parentsData = {
      chapterId: chapter?.id,
      chapterLabel: chapter?.label,
      blockId: block.id,
      blockLabel: block.label,
    };
    res.status(200).json({
      ...parentsData,
      ...data,
    });
    return;
  } catch (error: any) {
    console.log("[ERROR]: "+error.message);
    resError(res, 500, "internal", "Something wrong happened! "+error.message);
    return;
  }
});

// Search blocks that match a given ID or a given Label query
router.get("/search/:key/:query", async (req, res)=>{
  const {key, query} = req.params;
  if (!query) {
    resError(res, 400, "bad-request", "A valid query string is required");
    return;
  }
  // Verify key is only a valid one (according to Block model)
  if (!["id", "label"].includes(String(key))) {
    stdRouteNotFound(res);
    return;
  }
  // Default number of elements per page
  const DEFAULT_COUNT = 10;

  try {
    // Retrieve matches
    const blocksMatches = await queryBlocksByKey(key, query);

    if (!blocksMatches) {
      resError(res, 404, "not-found", "No blocks matched with given parameter");
      return;
    }
    const sortParams = getRequestSortParameters(req, blocksMatches);
    const sortedMatches = sortData(sortParams);
    const {page, count} = getRequestPaginationParameters(req, DEFAULT_COUNT);
    const data = paginateData(sortedMatches, page, count);
    // Send json response
    res.json(data);
  } catch (error:any) {
    console.log("[ERROR]: "+error.message);
    resError(res, 500, "internal", "Something wrong happened! "+error.message);
    return;
  }
});

export default router;

