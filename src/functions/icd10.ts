/**
 * Functions to manage ICD 10 resources
 * @author: Gregorio Alvarez <allgrego14@gmail.com>
 * @copyright: Wellness Mervra 2022
 */
import csv from "csv-parser";
import fetch from "cross-fetch";
import {createReadStream} from "fs";
import {resolve} from "path";
import {romanNumerals} from "./misc";
import {Disease, Category, Block, Chapter, Subcategory} from "../interfaces/icd10";

// CSV files paths
export const chaptersCsvFilePath = resolve(__dirname, "../../", "data", "csv", "icd10-2019-dx-chapters.csv");
export const blocksCsvFilePath = resolve(__dirname, "../../", "data", "csv", "icd10-2019-dx-blocks.csv");
export const categoriesCsvFilePath = resolve(__dirname, "../../", "data", "csv", "icd10-2019-dx-categories.csv");
export const subcategoriesCsvFilePath = resolve(__dirname, "../../", "data", "csv", "icd10-2020-dx-v2.csv");

const filePath = subcategoriesCsvFilePath;
// [
//   { code: 'A1811', name: 'Tuberculosis del riñón y del uréter' },
// ]

/**
 * Retrieve all ICD10 Chapters data from CSV file
 * @return {Promise<Chapter[] | undefined>}: Array of chapters if found, otherwise undefined
 */
export const getAllChapters = () : Promise<Chapter[] | undefined> => new Promise((resolve, reject)=>{
  const chapters: any[] = [];
  const SEPARATOR : Readonly<string> = ";";
  try {
    const csvStream = createReadStream(chaptersCsvFilePath, "utf-8")
    // Pipe to CSV with custom separator
        .pipe(csv({separator: SEPARATOR}));
    // Add data to array buffer
    csvStream.on("data", (chunk: any)=>chapters.push(chunk));
    // At the end return Chapters array or undefined
    csvStream.on("end", ()=>{
      if (chapters.length)resolve(chapters);
      else resolve(undefined);
    });
  } catch (error: any) {
    console.log("[ERROR]: ", error.message);
    reject(error);
  }
});

/**
 * Retrieve a single ICD10 chapter data from CSV file
 * @param {string | number} id: Chapter number ID in roman numeral or decimal value
 * @return {Promise<Chapter | undefined>}: Chapter data if found, otherwise undefined
 */
export const getChapter = (id : string | number) : Promise<Chapter | undefined> => new Promise((resolve, reject)=>{
  if (!id) reject(new Error("Chapter ID in roman numeral is required"));
  const SEPARATOR : Readonly<string> = ";";
  try {
    const csvStream = createReadStream(chaptersCsvFilePath, "utf-8")
    // Pipe to CSV with custom separator
        .pipe(csv({separator: SEPARATOR}));
    // Add data to array buffer
    csvStream.on("data", (chapter: any)=>{
      const chapterId = String(chapter.id).toLowerCase().trim();
      const normalizedId = String(id).toLowerCase().trim();
      const romanId = String(romanNumerals[Number(id)]).toLowerCase().trim();
      // Verify ID is equal (in roman as in decimal)
      if (chapterId === normalizedId || chapterId === romanId) {
        // Return chapter
        resolve(chapter);
        // Stop stream
        csvStream.destroy();
      }
    });
    // At the end return undefined because no chapter matched
    csvStream.on("end", ()=>resolve(undefined));
  } catch (error: any) {
    console.log("[ERROR]: ", error.message);
    reject(error);
  }
});

/**
 * Retrieve chapters which labels matches a given string
 * @param {string} query: String to be searched on chapters labels
 * @return {Promise<Chapter[] | undefined>}
 */
export const queryChaptersByLabel = (query : string) : Promise<Chapter[] | undefined> => new Promise((resolve, reject)=>{
  if (!query) reject(new Error("A query string is required"));
  const MINIMUM_LENGHT = 2;
  if (query?.length<MINIMUM_LENGHT) reject(new Error(`At least ${MINIMUM_LENGHT} characters are required`));

  const matches : any[] = [];
  try {
    const SEPARATOR = ";";
    const csvStream = createReadStream(chaptersCsvFilePath, "utf-8").pipe(csv({separator: SEPARATOR}));
    csvStream.on("data", (chapter : Chapter)=>{
      if (chapter) {
        const normalizedQueryString = query?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const normalizedChapterLabel = chapter.label?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        // Verify query is a substring of Chapter label and add it to matches
        if (normalizedChapterLabel?.includes(normalizedQueryString)) matches.push(chapter);
      }
    });
    // At the end return found matches (undefined if none)
    csvStream.on("end", ()=>resolve(matches.length? matches : undefined));
  } catch (error) {
    console.log(error);
    reject(error);
  }
});

/**
 * Fetch Chapters data from WHO API
 * @return {Promise<any[] | undefined>}: Array of chapters if found, otherwise undefined
 */
export const fetchChaptersStructure = async () : Promise<any[] | undefined> => {
  const rootUrl = "https://icd.who.int/browse10/2019/en/JsonGetRootConcepts?useHtml=false";
  try {
    const response = await fetch(rootUrl);
    if (response.ok) {
      const responseJson = await response.json();
      return responseJson;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

/**
 * Fetch a single Chapter data from WHO API
 * @param {string} id: Chapter ID
 * @return {Promise<any|undefined>}: Chapter if found, otherwise undefined
 */
export const fetchChapterStructure = async (id : string) : Promise<any | undefined> => {
  if (!id) throw new Error("ID is required");
  try {
    const chapters = await fetchChaptersStructure();
    const result = chapters?.filter((c) => String(c.ID).toLowerCase() === String(id).toLowerCase());
    return result&&result?.length>0 ? result[0] : undefined;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/**
 * Fetch all Blocks of a chapter data from WHO API
 * @param {string} chapterId: Chapter ID
 * @return {Promise<any[] | undefined>}: Chapter if found, otherwise undefined
 */
export const fetchChapterBlocks = async (chapterId : string) : Promise<any[] | undefined> => {
  if (!chapterId) throw new Error("ID is required");
  try {
    // const chapter: any = await fetchChapterStructure(chapterId);
    // if (!chapter) return undefined;
    const blocksUrl = `https://icd.who.int/browse10/2019/en/JsonGetChildrenConcepts?ConceptId=${chapterId}&useHtml=false&showAdoptedChildren=true`;
    const response = await fetch(blocksUrl);
    if (!response.ok) throw new Error("There was a problem fetching data");
    const responseJson = await response.json();
    if (!Array.isArray(responseJson)||!responseJson.length) return undefined;
    return responseJson;
  } catch (error: any) {
    console.log("[ERROR]: ", error.message);
    return undefined;
  }
};

/**
 * Retrieve all ICD10 blocks for a given Chapter from a CSV file
 * @param {string | number | undefined} chapterId: Chapter number ID in roman numeral or decimal value. Omit this argument to get ALL blocks
 * @return {Promise<any[] | undefined>}: Chapter data if found, otherwise undefined
 */
export const getAllBlocks = (chapterId?: string | number) : Promise<any[] | undefined> => new Promise((resolve, reject)=>{
  const blocks : any[] = [];
  const SEPARATOR : Readonly<string> = ";";
  try {
    const csvStream = createReadStream(blocksCsvFilePath, "utf-8")
    // Pipe to CSV with custom separator
        .pipe(csv({separator: SEPARATOR}));
    // Add data to array buffer
    csvStream.on("data", (block: any)=>{
      const blockChapterId = String(block.chapterId).toLowerCase().trim();
      const normalizedChapterId = String(chapterId).toLowerCase().trim();
      const normalizedRomanId = String(romanNumerals[Number(chapterId)]).toLowerCase().trim();
      const condition = blockChapterId === normalizedChapterId || blockChapterId === normalizedRomanId;
      // Add to blocks if ID matches (in roman or in decimal)
      if (condition||!chapterId) blocks.push(block);
    });
    // At the end return all retrieved blocks
    csvStream.on("end", ()=>resolve(blocks.length? blocks : undefined));
  } catch (error: any) {
    console.log("[ERROR]: ", error.message);
    reject(error);
  }
});

/**
 * Retrieve a specific ICD10 block for a given block ID from a CSV file
 * @param {string} blockId: Block ID in format "X00-Y99"
 * @return {Promise<Block | undefined>}: Block data if found, otherwise undefined
 */
export const getBlock = (blockId : string) : Promise<Block | undefined> => new Promise((resolve, reject)=>{
  if (!blockId) reject(new Error("Block ID is required"));
  const SEPARATOR : Readonly<string> = ";";
  try {
    const csvStream = createReadStream(blocksCsvFilePath, "utf-8")
    // Pipe to CSV with custom separator
        .pipe(csv({separator: SEPARATOR}));
    // Add data to array buffer
    csvStream.on("data", (block: any)=>{
      if (String(blockId).toLowerCase().trim() === String(block.id).toLowerCase().trim()) {
        // Return current block if matches
        resolve(block);
        // Close Stream
        csvStream.destroy();
      }
    });
    // At the end return undefined for any block matched
    csvStream.on("end", ()=>resolve(undefined));
  } catch (error: any) {
    console.log("[ERROR]: ", error.message);
    reject(error);
  }
});

/**
 * Retrieve blocks which values of given key matches a given string
 * @param {string} key: String to be searched on blocks keys
 * @param {string} query: String to be searched on keys
 * @return {Promise<Block[] | undefined>}
 */
export const queryBlocksByKey = (key: string, query : string) : Promise<Block[] | undefined> => new Promise((resolve, reject)=>{
  if (!query) reject(new Error("A query string is required"));
  const MINIMUM_LENGHT = 1;
  if (query?.length<MINIMUM_LENGHT) reject(new Error(`At least ${MINIMUM_LENGHT} characters are required`));
  // Keys that are valid for a Block model
  const validKeys : string[] = ["id", "label"];

  // Verify provided key is a valid one
  if (!validKeys.includes(String(key).toLowerCase())) {
    reject(new Error("A valid key must be provided. Options: "+validKeys.join(", ")));
  }
  const matches : any[] = [];
  try {
    const SEPARATOR = ";";
    const csvStream = createReadStream(blocksCsvFilePath, "utf-8").pipe(csv({separator: SEPARATOR}));
    csvStream.on("data", (block : Record<string, string>)=>{
      if (block) {
        const normalizedQueryString = query?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const blockValue: string | undefined = block[String(key)];
        const normalizedBlockValue = blockValue?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        // Verify query is a substring of Chapter label and add it to matches
        if (normalizedBlockValue?.includes(normalizedQueryString)) matches.push(block);
      }
    });
    // At the end return found matches (undefined if none)
    csvStream.on("end", ()=>resolve(matches.length? matches : undefined));
  } catch (error) {
    console.log(error);
    reject(error);
  }
});

/**
 * Fetch all Categories of a block from WHO API
 * @param {string} blockId: Chapter ID
 * @return {Promise<any[] | undefined>}: Chapter if found, otherwise undefined
 */
export const fetchBlockCategories = async (blockId : string) : Promise<any[] | undefined> => {
  if (!blockId) throw new Error("Block ID is required");
  try {
    // const chapter: any = await fetchChapterStructure(chapterId);
    // if (!chapter) return undefined;
    const categoriesUrl = `https://icd.who.int/browse10/2019/en/JsonGetChildrenConcepts?ConceptId=${blockId.toUpperCase()}&useHtml=false&showAdoptedChildren=true`;
    const response = await fetch(categoriesUrl);
    if (!response.ok) throw new Error("There was a problem fetching categories");
    const responseJson = await response.json();
    if (!Array.isArray(responseJson)||!responseJson.length) return undefined;
    return responseJson;
  } catch (error: any) {
    console.log("[ERROR]: ", error.message);
    return undefined;
  }
};

/**
 * Retrieve ALL categories (only for a given block if ID is provided)
 * @param {string} blockId: ID of block
 * @return {Category[]|undefined}: All categories (only for a given block if valid block ID is provided)
 */
export const getAllCategories = async (blockId? : string) : Promise<Category[] | undefined> => new Promise((resolve, reject)=>{
  const SEPARATOR = ";";
  const categories : Category[] = [];
  try {
    const csvStream = createReadStream(categoriesCsvFilePath, "utf-8").pipe(csv({separator: SEPARATOR}));
    csvStream.on("data", (category: Category )=>{
      // If block ID is the same as provided (or there is no blockId)
      if (
        String(blockId).toLowerCase().trim() === String(category?.blockId).toLowerCase().trim() ||
        !blockId
      ) {
        // Add to categories array
        categories.push(category);
        // Continue querying
      }
    });
    csvStream.on("end", ()=>{
      // Return gathered categories or undefined if none
      resolve(categories.length? categories : undefined);
    });
  } catch (error) {
    reject(error);
  }
});

/**
 * Retrieve a Category correspondent to a given ID
 * @param {string} categoryId
 * @return {Promise<Category|undefined>}
 */
export const getCategory = async (categoryId : string) : Promise<Category | undefined> => new Promise((resolve, reject)=>{
  if (!categoryId) throw new Error("categoryId is required");
  // CSV Separator
  const SEPARATOR = ";";
  try {
    const csvStream = createReadStream(categoriesCsvFilePath, "utf-8").pipe(csv({separator: SEPARATOR}));
    csvStream.on("data", (category: Category)=>{
      // If block ID is the same as provided
      if (String(categoryId).toLowerCase().trim() === String(category.id).toLowerCase().trim()) {
        // Return match
        resolve(category);
        // Destroy stream
        csvStream.destroy();
      }
    });
    // If end reached, none matched
    csvStream.on("end", ()=>resolve(undefined));
  } catch (error) {
    reject(error);
  }
});

/**
 * Retrieve all Subcategories (Also known as Diseases or Diagnostics)
 * @param {string} categoryId: ID of category to fetch
 * @return {Promise<Subcategory[]|undefined>}: Array of all categories (of a given category if provided ID), or undefined if none
 */
export const getAllSubcategories = (categoryId?: string): Promise<Subcategory[]|undefined> => new Promise((resolve, reject)=>{
  const subcategories: Subcategory[] | undefined = [];
  try {
    const stream = createReadStream(subcategoriesCsvFilePath, "utf-8").pipe(csv());
    stream.on("data", (chunk : {code: string, name: string}) => {
      const id = chunk.code;
      const label = chunk.name;
      const inferredCategoryId = id.slice(0, 3);

      if (!categoryId || inferredCategoryId.toLowerCase().trim() === categoryId.toLowerCase().trim()) {
        subcategories.push({
          id,
          label,
          categoryId: inferredCategoryId,
        });
      }
    });
    stream.on("end", () =>resolve(subcategories.length? subcategories : undefined));
  } catch (error: any) {
    reject(error);
  }
});

/**
 * Retrieve query which values of given key matches a given string
 * @param {string} key: String to be searched on categories keys
 * @param {string} query: String to be searched on categories keys
 * @return {Promise<Category[] | undefined>}
 */
export const queryCategoriesByKey = (key: string, query : string) : Promise<Category[] | undefined> => new Promise((resolve, reject)=>{
  if (!query) reject(new Error("A query string is required"));
  const MINIMUM_LENGHT = 1;
  if (query?.length<MINIMUM_LENGHT) reject(new Error(`At least ${MINIMUM_LENGHT} characters are required`));
  // Keys that are valid for a Category model
  const validKeys : string[] = ["id", "label"];

  // Verify provided key is a valid one
  if (!validKeys.includes(String(key).toLowerCase())) {
    reject(new Error("A valid key must be provided. Options: "+validKeys.join(", ")));
  }
  const matches : any[] = [];
  try {
    const SEPARATOR = ";";
    const csvStream = createReadStream(categoriesCsvFilePath, "utf-8").pipe(csv({separator: SEPARATOR}));
    csvStream.on("data", (category : Record<string, string>)=>{
      if (category) {
        const normalizedQueryString = query?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const categoryValue: string | undefined = category[String(key)];
        const normalizedBlockValue = categoryValue?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        // Verify query is a substring of Chapter label and add it to matches
        if (normalizedBlockValue?.includes(normalizedQueryString)) matches.push(category);
      }
    });
    // At the end return found matches (undefined if none)
    csvStream.on("end", ()=>resolve(matches.length? matches : undefined));
  } catch (error) {
    console.log(error);
    reject(error);
  }
});

/**
 * Retrieve name of disease in spanish
 * @param {string} code: ICD 10 code of disease to search
 * @return {Promise< Disease | undefined>}: Name of disease in spanish if found, otherwise undefined
 */
export const diseaseByCode = (code : string | undefined) : Promise< Disease | undefined>=> new Promise< Disease | undefined>((resolve, reject)=>{
  if (!code|| typeof code !== "string") reject(new Error("code is required and must be an string"));

  let disease : Disease | undefined = undefined;

  try {
    // Create a readable stream of CSV file
    const stream = createReadStream(filePath);
    // Pipe it to CSV module
    stream.pipe(csv())
        .on("data", (data) => {
          if (String(data?.code).toLowerCase() === code?.toLowerCase()) {
            disease = {
              code: data.code,
              name: data.name,
            };
            stream.destroy();
            resolve(disease);
          }
        });
    stream.on("close", (e: any) => {
      console.log("diseaseByCode[INFO]: Stream closed due to disease found");
    });
    stream.on("end", () => {
      // If no disease was found resolve undefined
      if (!disease) resolve(undefined);
    });
  } catch (error) {
    reject(error);
  }
});

/**
 * Search diseases which names match given string name
 * @param {string} queryString: string to be find in diseases
 * @param {boolean} exact: Must match from start of string if true
 * @return {Promise< Disease[]>}: array of diseases that matched
 */
export const queryDiseasesByName = (queryString : string, exact? : boolean) : Promise< Disease[] | undefined>=> new Promise< Disease[]>((resolve, reject)=>{
  if (!queryString|| typeof queryString !== "string") reject(new Error("Query string is required"));
  const MINIMUM_LENGHT = 2;
  if (queryString?.length<MINIMUM_LENGHT) reject(new Error(`At least ${MINIMUM_LENGHT} characters are required`));

  const matches : any[] = [];
  try {
    const stream = createReadStream(filePath);
    stream.pipe(csv())
        .on("data", (disease : Disease)=>{
          const normalizedQueryString = queryString?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
          const normalizedDiseaseName = disease.name?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
          // Condition depends on exact parameter
          const condition = exact? normalizedDiseaseName.startsWith(normalizedQueryString!) : normalizedDiseaseName?.includes(normalizedQueryString!);

          if (condition) matches.push(disease);
        });
    stream.on("end", ()=>{
      resolve(matches);
    })
        .on("close", ()=>{
          resolve(matches);
        });
  } catch (error) {
    console.log(error);
    reject(error);
  }
});

/**
 * Search diseases which codes match given string code
 * @param {string} codeQuery: string to be find in disease
 * @return {Promise< Disease[]>}: array of diseases that matched
 */
export const queryDiseasesByCode = (codeQuery : string) : Promise< Disease[] | undefined>=> new Promise< Disease[] | undefined>((resolve, reject)=>{
  if (!codeQuery|| typeof codeQuery !== "string") reject(new Error("Query string is required"));

  const MINIMUM_LENGHT = 2;
  if (codeQuery?.length<MINIMUM_LENGHT) reject(new Error(`At least ${MINIMUM_LENGHT} characters are required`));

  // Diseases that matches
  const matches : any[] = [];
  try {
    const stream = createReadStream(filePath);
    stream.pipe(csv())
        .on("data", (disease : Disease)=>{
          const normalizedQueryCode = codeQuery?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
          const normalizedDiseaseCode = disease.code?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

          if (normalizedDiseaseCode?.startsWith(normalizedQueryCode!)) {
            matches.push(disease);
          }
        });
    stream.on("end", ()=>{
      console.log("Finished");
      resolve(matches);
    })
        .on("close", ()=>{
          resolve(matches);
        });
  } catch (error) {
    console.log(error);
    reject(error);
  }
});
