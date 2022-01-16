/**
 * Routes for categories (/v1/categories/**)
 * @author: Gregorio Alvarez <allgrego14@gmail.com>
 */

import {Router as expressRouter} from "express";
import {paginateData, sortData} from "../../../functions/datahandler";
import {getRequestPaginationParameters, getRequestSortParameters, resError, stdRouteNotFound} from "../../../functions/express";
import {getAllCategories, getAllSubcategories, getBlock, getCategory, getChapter, queryCategoriesByKey} from "../../../functions/icd10";

const router = expressRouter();

// Middleware specific for these routes
router.use((req, res, next)=>{
  // Not much for now
  next();
});

// Retrieves all categories
router.get("/", async (req, res)=>{
  const DEFAULT_COUNT = 10;

  try {
    // Retrieve ALL categories
    const categories = await getAllCategories();
    // If no categories are found, it's because an internal error
    if (!categories) throw new Error("No categories were found");
    // Sort categories
    const sortParams = getRequestSortParameters(req, categories, "id");
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

// Retrieve a single category for a given ID
router.get("/:categoryId", async (req, res)=>{
  const {categoryId} = req.params;
  try {
    const category = await getCategory(categoryId);
    if (!category) {
      resError(res, 404, "not-found", "No category were found for given ID");
      return;
    }
    const block = await getBlock(category.blockId);
    const chapter = await getChapter(String(block?.chapterId));
    const subcategories = await getAllSubcategories(category.id);

    // JSON data to send
    const data = {
      id: category.id,
      label: category.label,
      blockId: block?.id,
      blockLabel: block?.label,
      chapterId: chapter?.id,
      chapterLabel: chapter?.label,
      totalSubcategories: subcategories?.length,
    };
    res.status(200).json(data);
    return;
  } catch (error: any) {
    console.log("[ERROR]: "+error.message);
    resError(res, 500, "internal", "Something wrong happened! "+error.message);
    return;
  }
});

// Retrieve all subcategories of a category for a given ID
router.get("/:categoryId/:key", async (req, res)=>{
  // Block ID to find its categories
  const {categoryId, key} = req.params;
  const validKeys = ["subcategories", "diseases", "diagnosis", "dx"];
  if (!validKeys.includes(String(key).toLowerCase())) {
    stdRouteNotFound(res);
    return;
  }
  try {
    // Retrieve category by ID
    const category = await getCategory(categoryId);
    if (!category) {
      resError(res, 404, "not-found", "No category were found for given ID");
      return;
    }
    // Retrieve block
    const block = await getBlock(category.blockId);
    // Retrieve Chapter for selected block
    const chapter = await getChapter(String(block?.chapterId));

    // Retrieve all subcategories of selected category
    const subcategories = await getAllSubcategories(category.id);
    if (!subcategories) {
      throw new Error("There was an error retrieving subcategories for category "+category.id);
    }
    // Remove categoryId field from subcategories
    const processedSubcategories : any[] = subcategories.map((c)=>{
      // Add a point to ID after third character
      const id = c.id.substring(0, 3)+"."+c.id.substring(3);
      return {id, label: c.label};
    });
    // Sort Categories by ID
    const sortParams = getRequestSortParameters(req, processedSubcategories, "id");
    const sortedSubcategories = sortData(sortParams);
    // Default number of elements per page
    const DEFAULT_COUNT = 10;
    // Get pagination parameters from request
    const {page, count} = getRequestPaginationParameters(req, DEFAULT_COUNT);
    // Paginate Sorted data
    const data = paginateData(sortedSubcategories, page, count);
    // Data of subcategories parents (Category, Block and Chapter)
    const parentsData = {
      chapterId: chapter?.id,
      chapterLabel: chapter?.label,
      blockId: block?.id,
      blockLabel: block?.label,
      categoryId: category.id,
      categoryLabel: category.label,
    };
    // Send JSON data
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
  // Verify key is a valid one (according to Category model)
  if (!["id", "label"].includes(String(key))) {
    stdRouteNotFound(res);
    return;
  }

  try {
    // Retrieve matches
    const categoriesMatches = await queryCategoriesByKey(key, query);
    console.log(categoriesMatches);

    if (!categoriesMatches) {
      resError(res, 404, "not-found", "No categories matched with given parameter");
      return;
    }
    const sortParams = getRequestSortParameters(req, categoriesMatches);
    const sortedMatches = sortData(sortParams);
    // Default number of elements per page
    const DEFAULT_COUNT = 20;
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


