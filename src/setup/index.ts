// /**
//  * Functions to initalize ICD10 resources
//  * @author: Gregorio Alvarez <allgrego14@gmail.com>
//  */

// import {diseaseByCode, getBlock, getCategory, getChapter} from "../functions/icd10";
// import {Category} from "../interfaces/icd10";
import {resolve} from "path";
import {createReadStream} from "fs";
import {createInterface} from "readline";
import {getBlock} from "../functions/icd10";

const blocksEsTxtFilePath = resolve(__dirname, "../../", "data", "txt", "ICD-10-Blocks-es.txt");

export const getEsBlocksTxt = async () : Promise<any[]|undefined> => new Promise((resolve, reject)=>{
  try {
    const data : any[] = [];
    const readInterface = createInterface({
      input: createReadStream(blocksEsTxtFilePath, "utf-8"),
    });
    readInterface.on("line", (input)=>{
      const id = input.slice(0, 7).trim();

      const label = input.slice(7)
          .replace("[", "(")
          .replace("]", ")")
          .trim();
      data.push({id, label});
    });
    readInterface.on("close", ()=>resolve(data.length? data : undefined));
    return;
  } catch (error: any) {
    reject(error.message);
  }
});

export const getEsBlock = async (blockId : string) : Promise<any|undefined> => {
  try {
    const blocks = await getEsBlocksTxt();
    if (!blocks) throw new Error("Error retrieving blocks");
    const block : any[] = blocks.find((b) => {
      const normalizedBlockId : string = String(b.id).toLowerCase().trim();
      const normalizedSearchedBlockId : string = String(blockId).toLowerCase().trim();
      return normalizedBlockId === normalizedSearchedBlockId;
    });
    return block? block : undefined;
  } catch (error: any) {
    console.log(error.message);
    return;
  }
};

/**
 * Main function. To run in this file
 * @return {void}
 */
async function main() {
  try {
    const blocksEs = await getBlock("a00-a09");
    console.log(blocksEs);
  } catch (error: any) {
    console.log("[ERROR]: ", error.message);
    return;
  }
}

main();
