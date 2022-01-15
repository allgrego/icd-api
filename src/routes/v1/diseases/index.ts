/**
 * All routes with the pattern "/diseases/**"
 * @author: Gregorio Alvarez <allgrego14@gmail.com>
 * @copyright: Wellness Mervra 2022
 */
import {Router as expressRouter} from "express";
import {paginateData} from "../../../functions/datahandler";
import {resError} from "../../../functions/express";
import {diseaseByCode, queryDiseasesByName, queryDiseasesByCode, getCategory, getBlock, getChapter} from "../../../functions/icd10";
import {Block, Category, Chapter} from "../../../interfaces/icd10";

const router = expressRouter();

// Middleware specific for these routes
router.use((req, res, next)=>{
  // Not much for now
  next();
});

// Retrieves disease for given code
// Considerations: Faster than /search/code
router.get("/code/:code", async (req, res) => {
  // Disease code
  const code = req.params.code;

  const disease = await diseaseByCode(code);
  if (!disease) {
    resError(res, 404, "not-found", "Disease not found for given code");
    return;
  }

  const categoryId = disease.code.slice(0, 3);
  const category: Category | undefined = await getCategory(categoryId);
  if (!category) {
    resError(res, 500, "internal", "Category not found for given disease code");
    return;
  }

  const block : Block | undefined = await getBlock(category.blockId);
  if (!block) {
    resError(res, 500, "internal", "Block not found for given disease code");
    return;
  }

  const chapter : Chapter | undefined = await getChapter(block.chapterId);
  if (!chapter) {
    resError(res, 500, "internal", "Chapter not found for given disease code");
    return;
  }
  const result = {
    id: disease.code,
    label: disease.name,
    categoryId: category.id,
    categoryLabel: category.label,
    blockId: block.id,
    blockLabel: block.label,
    chapterId: chapter.id,
    chapterLabel: chapter.label,
  };
  res.json(result);
  return;
});

// Diseases search by code
router.get("/search/code", async (req, res) =>{
  const code = req.query.q;
  const count = req.query.count;
  const page = req.query.page;

  if (!code) {
    res.status(400).json({
      error: {
        status: "bad-request",
        message: "code to query (q parameter) is required",
      },
    });
  }

  const MAX_ELEMENTS_PER_PAGE=100;

  if (!!count&&Number(count)>MAX_ELEMENTS_PER_PAGE) {
    res.status(400).json({
      error: {
        status: "invalid-arguments",
        message: `Elements per page (count parameter) must be less than ${MAX_ELEMENTS_PER_PAGE}`,
      },
    });
    return;
  }

  try {
    const diseases = await queryDiseasesByCode(String(code));

    if (!diseases?.length) {
      res.status(404).json({
        error: {
          status: "not-found",
          message: "Diseases not found for given parameter",
        },
      });
      return;
    }

    const results = paginateData(diseases, Number(page), Number(count));
    res.json(results);
    return;
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      error: {
        status: "bad-request",
        message: error.message||"Something unexpected went wrong!",
      },
    });
    return;
  }
});

// Diseases search by name
router.get("/search/name", async (req, res) =>{
  const name = req.query.q;
  const count = req.query.count;
  const page = req.query.page;

  if (!name) {
    res.status(400).json({
      error: {
        status: "bad-request",
        message: "code to query (q parameter) is required",
      },
    });
  }

  const validStringBooleans = ["true", "yes", "on"];
  const exact = validStringBooleans.includes(String(req.query.strictQuery).toLowerCase());

  const MAX_ELEMENTS_PER_PAGE=100;

  if (!!count&&Number(count)>MAX_ELEMENTS_PER_PAGE) {
    res.status(400).json({
      error: {
        status: "invalid-arguments",
        message: `Elements per page (count parameter) must be less than ${MAX_ELEMENTS_PER_PAGE}`,
      },
    });
    return;
  }

  try {
    const diseases = await queryDiseasesByName(String(name), exact);

    if (!diseases?.length) {
      res.status(400).json({
        error: {
          status: "not-found",
          message: "Diseases not found for given parameter",
        },
      });
      return;
    }

    const results = paginateData(diseases, Number(page), Number(count));
    res.json(results);
    return;
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      error: {
        status: "bad-request",
        message: error.message||"Something unexpected went wrong!",
      },
    });
    return;
  }
});

export default router;

