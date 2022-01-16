/**
 * Routes for chapters (/chapters/**)
 * @author: Gregorio Alvarez <allgrego14@gmail.com>
 */

import {Router as expressRouter} from "express";
import {paginateData, sortData} from "../../../functions/datahandler";
import {getRequestPaginationParameters, getRequestSortParameters, resError} from "../../../functions/express";
import {getAllBlocks, getAllChapters, getChapter, queryChaptersByLabel} from "../../../functions/icd10";
import {Block} from "../../../interfaces/icd10";

const router = expressRouter();

// Middleware specific for these routes
router.use((req, res, next)=>{
  // Not much for now
  next();
});

// Retrieves all chapters
router.get("/", async (req, res)=>{
  try {
    const chapters = await getAllChapters();
    if (!chapters) {
      resError(res, 500, "internal", "Chapters could not be retrieved");
      return;
    }
    // Default number of elements per page
    const DEFAULT_COUNT = 10;
    // Get pagination parameters from request
    const {page, count} = getRequestPaginationParameters(req, DEFAULT_COUNT);
    // Paginate data (NOT sorted)
    const data = paginateData(chapters, page, count);
    res.json(data);
  } catch (error: any) {
    console.log("[ERROR]: "+error.message);
    resError(res, 500, "internal", "Something wrong happened! "+error.message);
    return;
  }
});

// Retrieve data of a specific chapter and its blocks
router.get("/:chapterId", async (req, res)=>{
  const {chapterId} = req.params;
  if (!chapterId) {
    resError(res, 400, "invalid-argument", "A valid chapter ID is required");
    return;
  }
  try {
    // Retrieve Chapter
    const chapter = await getChapter(chapterId);
    if (!chapter) {
      resError(res, 404, "not-found", "No chapter was found for given chapter ID");
      return;
    }
    // Retrieve Blocks
    const blocks = await getAllBlocks(chapter.id);
    // Send json response
    res.json({...chapter, totalBlocks: blocks?.length});
  } catch (error:any) {
    console.log("[ERROR]: "+error.message);
    resError(res, 500, "internal", "Something wrong happened! "+error.message);
    return;
  }
});

// Retrieve all blocks of a specific chapter
router.get("/:chapterId/blocks", async (req, res)=>{
  const {chapterId} = req.params;

  if (!chapterId) {
    resError(res, 400, "invalid-argument", "A valid chapter ID is required");
    return;
  }
  const chapter = await getChapter(chapterId);
  if (!chapter) {
    resError(res, 404, "not-found", "No chapter was found for given chapter ID");
    return;
  }
  try {
    const blocks : Block[] | undefined = await getAllBlocks(chapter.id);
    if (!blocks) {
      resError(res, 404, "not-found", "No blocks were found for given chapter ID");
      return;
    }
    // Remove chapter ID from each block
    const processedBlocks = blocks.map((b: Block)=>{
      return {
        id: b.id,
        label: b.label,
      };
    });
    // Sort Parameters from request (or default)
    const sortParams = getRequestSortParameters(req, processedBlocks, "id");
    // Sort blocks
    const sortedBlocks = sortData(sortParams);

    // Pagination Parameters from request (or default)
    const DEFAULT_COUNT = 10;
    const {page, count} = getRequestPaginationParameters(req, DEFAULT_COUNT);
    // Paginate Data and get pagination parameters
    const data = paginateData(sortedBlocks, page, count);
    // Send JSON data
    res.json({chapterId: chapter.id, chapterLabel: chapter.label, ...data});
  } catch (error:any) {
    console.log("[ERROR]: "+error.message);
    resError(res, 500, "internal", "Something wrong happened! "+error.message);
    return;
  }
});

// Query chapters which labels match a given parameter
router.get("/search/label/:queryString", async (req, res)=>{
  const {queryString} = req.params;
  if (!queryString) {
    resError(res, 400, "bad-request", "A valid query string (q parameter) is required");
    return;
  }
  // Default number of elements per page
  const DEFAULT_COUNT = 10;
  try {
    // Retrieve matches
    const chaptersMatches = await queryChaptersByLabel(String(queryString));

    if (!chaptersMatches) {
      resError(res, 404, "not-found", "No chapters label matched given parameter");
      return;
    }

    const {page, count} = getRequestPaginationParameters(req, DEFAULT_COUNT);
    const data = paginateData(chaptersMatches, page, count);
    // Send json response
    res.json(data);
  } catch (error:any) {
    console.log("[ERROR]: "+error.message);
    resError(res, 500, "internal", "Something wrong happened! "+error.message);
    return;
  }
});

export default router;
