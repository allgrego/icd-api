/**
 * Functions to handle ICD 10
 * @author: Gregorio Alvarez <allgrego14@gmail.com>
 * @copyright: Wellness Mervra 2022
 */
import csv from "csv-parser";
import {createReadStream} from "fs";
import {resolve} from "path";

const filePath = resolve(__dirname, "../../data/csv", "icd10-2020-dx-v2.csv");
// [
//   { code: 'A1811', name: 'Tuberculosis del riñón y del uréter' },
// ]

interface Disease {
  code: string,
  name: string,
  category?: string
  metaCategory?: string
}

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
