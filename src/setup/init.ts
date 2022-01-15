/**
 * Functions to Initialize and Modify CSV files from WHO API (in english) or other sources
 * WARNING: Be careful and be sure you know what you are doing with these,
 * you could lose or overwrite valuable data
 * @author: Gregorio Alvarez <allgrego14@gmail.com>
 */

import {existsSync, createWriteStream, createReadStream} from "fs";
import {resolve as fsResolve} from "path";
import csv from "csv-parser";
import {blocksCsvFilePath, categoriesCsvFilePath, chaptersCsvFilePath, fetchBlockCategories, fetchChapterBlocks, fetchChaptersStructure, getAllBlocks, getAllChapters} from "../functions/icd10";
import {delay} from "../functions/misc";
import {getEsBlock} from ".";

/**
 * Initialize CSV Data file for ICD10 Chapters in english
 * Source: https://icd.who.int/browse10/2019/en/JsonGetRootConcepts?useHtml=false
 * @return {void}
 */
export const initChapters = async () => {
  console.log("Initializing ICD-10 Chapters file...");
  try {
    const filePath = chaptersCsvFilePath;
    if (existsSync(filePath)) console.log("[WARNING]: Overwriting file...");
    else console.log("[INFO]: Creating file...");

    const chaptersStructure = await fetchChaptersStructure();
    const chapters = chaptersStructure?.map((c: any) => {
      const chapterId = c["ID"];
      const label = String(c.label).replace(chapterId, "").trim();
      return {id: chapterId, label};
    });
    // CSV Headers
    const headers = ["id", "label"];
    const parsedChapters : any[] = chapters?.map((c) => Object.values(c)) || [];
    // Preppend headers to data
    const data : any[] = [headers, ...parsedChapters];
    // Init stream to write on file
    const writeStream = createWriteStream(filePath, {flags: "w", encoding: "utf-8"});
    // CSV Delimitator (not comma to avoid confusions with commas in chapters labels)
    const DELIMITATOR = ";";
    // Write each
    data.forEach((c) => writeStream.write(c.join(DELIMITATOR)+"\r\n"));
    writeStream.end();

    console.log(`[INFO]: ICD-10 Chapters added to ${filePath}`);
  } catch (error: any) {
    console.log("[ERROR]: ", error.message);
    return;
  }
};

/**
 * Initialize CSV Data file for ICD10 Blocks in english
 * Source: https://icd.who.int/browse10/2019/en/JsonGetChildrenConcepts
 * @return {void}
 */
export const initBlocks = async () => {
  console.log("Initializing ICD-10 blocks file...");

  try {
    const filePath = blocksCsvFilePath;
    if (existsSync(filePath)) console.log("[WARNING]: Overwriting file...");
    else console.log("[INFO]: Creating file...");
    // CSV Headers
    const headers = ["id", "label", "chapterId"];

    const writeStream = createWriteStream(filePath, {
      encoding: "utf-8",
      flags: "w",
    });
    // CSV Delimitator
    const DELIMITATOR = ";";
    // Retrieve Chapters
    const chaptersStructure = await fetchChaptersStructure();
    // Modify chapters structure
    const chapters = chaptersStructure?.map((c) => {
      return {id: c["ID"], label: String(c.label).replace(c["ID"], "").trim()};
    });
    if (!chapters) throw new Error("No chapters were found");
    console.log("Writing data to "+filePath);

    // Write headers on file
    writeStream.write(headers.join(DELIMITATOR)+"\r\n");
    // Iterate on each chapter
    chapters?.forEach(async (c) => {
      // Chapter ID
      const id = c.id;
      // console.log("Chapter "+id+"\r\n");
      // Retrieve blocks for current chapter
      const blocksStructure = await fetchChapterBlocks(id);

      // Iterate on each block
      blocksStructure?.forEach((b) => {
        const blockId = b["ID"];
        const blockLabel = String(b.label).replace(blockId, "").trim();

        const data = [blockId, blockLabel, id].join(DELIMITATOR);
        // Write block on file
        writeStream.write(data+"\r\n");
      });
      // data.push(["id", "label", id]);
    });
  } catch (error: any) {
    console.log("[ERROR]: ", error.message);
    return;
  }
};

/**
 * Initialize CSV Data file for ICD10 Categories in english
 * Source: https://icd.who.int/browse10/2019/en/JsonGetChildrenConcepts?
 * @return {void}
 */
export const initCategories = async () => {
  console.log("Initializing ICD-10 categories file...");
  console.time("Run");

  try {
    const filePath = categoriesCsvFilePath;
    if (existsSync(filePath)) console.log("[WARNING]: Overwriting file...");
    else console.log("[INFO]: Creating file...");
    // CSV Headers
    const headers = ["id", "label", "blockId"];

    const writeStream = createWriteStream(filePath, {
      encoding: "utf-8",
      flags: "w",
    });
    // CSV Delimitator
    const DELIMITATOR = ";";
    // Retrieve All Chapters
    const chapters : any[] | undefined = await getAllChapters();

    if (!chapters||!chapters.length) throw new Error("No chapters were found");
    // Write headers to file
    writeStream.write(headers.join(DELIMITATOR)+"\r\n");

    // Iterate on chapters
    for (const i in chapters) {
      if (i) {
        const chapterId = chapters[Number(i)].id;
        const blocks = await getAllBlocks(chapterId);
        console.log("Chapter "+chapterId+":");
        // Iterate on blocks
        for (const j in blocks) {
          if (j) {
            const delayTime = 400+(Math.random()*1000);
            // Delay of 0.5s
            console.log("Waiting "+Math.trunc(delayTime)+"ms");
            await delay(delayTime);

            const blockId = blocks[Number(j)].id;
            const categories : any [] | undefined = await fetchBlockCategories(blockId);
            if (!categories||!Array.isArray(categories)) {
              throw new Error(`No categories for block ${blockId}, chapter ${chapterId}`);
            }
            // Iterate on each category
            for (const k in categories) {
              if (k) {
                const id = categories[k]["ID"];
                const label = String(categories[k]["label"]).replace(id, "");
                const category = {
                  id,
                  label,
                  blockId,
                };
                const data = [category.id, category.label, category.blockId].join(DELIMITATOR)+"\r\n";
                writeStream.write(data);
              }
            }
            console.log("\tBlock "+blockId+" - Chapter "+chapterId);
            console.log("\tCategories added: "+categories.length);
            console.log();
          }
        }
      }
    }
    writeStream.end();
    console.timeEnd("Run");
  } catch (error: any) {
    console.log("[ERROR]: ", error.message);
    return;
  }
};


export const translateBlocks = async () : Promise<void> => new Promise((resolve, reject)=>{
  const blocksCsvFilePathEn = fsResolve(__dirname, "../../", "data", "csv", "icd10-2019-dx-blocks-en.csv");
  const SEPARATOR = ";";
  const readStream = createReadStream(blocksCsvFilePathEn, "utf-8").pipe(csv({separator: SEPARATOR}));
  const writeStream = createWriteStream(blocksCsvFilePath, "utf-8");
  // Write Headers on file
  const headers = ["id", "label", "chapterId"];
  writeStream.write(headers.join(SEPARATOR)+"\r\n");
  // Data read
  readStream.on("data", async (block)=>{
    // Retrieve spanish block
    const blockEs = await getEsBlock(block.id);
    // CSV data to write (with spanish label if there is)
    const data = [block.id, blockEs?blockEs.label : block.label, block.chapterId].join(SEPARATOR)+"\r\n";
    writeStream.write(data);
  });
  readStream.on("end", ()=>console.log("Finished"));
});
