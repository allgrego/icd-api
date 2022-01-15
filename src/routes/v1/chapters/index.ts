/**
 * Routes for chapters (/chapters/**)
 * @author: Gregorio Alvarez <allgrego14@gmail.com>
 */

import {Router as expressRouter} from "express";
import {paginateData} from "../../../functions/datahandler";
import {resError} from "../../../functions/express";
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
  const {page, count} = req.query;
  const DEFAULT_COUNT = 10;
  try {
    const chapters = await getAllChapters();
    if (!chapters) {
      resError(res, 500, "internal", "Chapters could not be retrieved");
      return;
    }
    const data = paginateData(chapters, Number(page), Number(count)||DEFAULT_COUNT);
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
  const {page, count} = req.query;
  const DEFAULT_COUNT = 10;

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
    const data = paginateData(blocks, Number(page), Number(count)||DEFAULT_COUNT);
    res.json(data);
  } catch (error:any) {
    console.log("[ERROR]: "+error.message);
    resError(res, 500, "internal", "Something wrong happened! "+error.message);
    return;
  }
});

// Query chapters which labels match a given parameter
router.get("/q/label", async (req, res)=>{
  const {page, count, q: queryString} = req.query;
  // Default number of elements per page
  const DEFAULT_COUNT = 10;
  if (!queryString) {
    resError(res, 400, "invalid-argument", "A valid query string (q parameter) is required");
    return;
  }
  try {
    // Retrieve matches
    const chaptersMatches = await queryChaptersByLabel(String(queryString));

    if (!chaptersMatches) {
      resError(res, 404, "not-found", "No chapters label matched given parameter");
      return;
    }

    const data = paginateData(chaptersMatches, Number(page), Number(count)||DEFAULT_COUNT);
    // Send json response
    res.json(data);
  } catch (error:any) {
    console.log("[ERROR]: "+error.message);
    resError(res, 500, "internal", "Something wrong happened! "+error.message);
    return;
  }
});

export default router;
