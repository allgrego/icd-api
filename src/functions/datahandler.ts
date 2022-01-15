/**
 * Functions to handle general data
 * @author: Gregorio Alvarez <allgrego14@gmail.com>
 * @copyright: Wellness Mervra 2022
 */

import {SortParameters} from "../interfaces/datahandler";

interface PaginatedData{
    data: any[],
    totalPages: number,
    page: number,
    totalElements: number,
    elementsPerPage: number,
}

/**
 * Paginate array of data and provide processed current page and total pages
 * @param {any[]} data: data to be paginated
 * @param {number} page: current page (unprocessed)
 * @param {number|undefined} elementsPerPage: amount of elements per page
 * @return {any[]}: array of paginated data, total amount of pages, and current page
 */
export const paginateData = (data : any[], page? : number, elementsPerPage? : number) : PaginatedData => {
  if (!data||!Array.isArray(data)) throw new Error("Invalid data to paginate");

  // Default Current Page
  const DEFAULT_PAGE = 1;
  const DEFAULT_COUNT = 20;
  // Get elements per page as processed integer
  let count : number = Math.floor(Number(elementsPerPage|| DEFAULT_COUNT));
  if (!count||count<1) count = DEFAULT_COUNT;
  if (count>data.length) count = data.length;
  // Compute total of pages according to data
  let totalPages = Math.ceil(data.length/count);
  if ( totalPages < 1) totalPages = 1;
  // Get current page  as processed integer
  let currentPage = Math.floor(Number(page) || DEFAULT_PAGE);
  if (!currentPage||currentPage<1) currentPage = DEFAULT_PAGE;
  else if ( currentPage>totalPages ) currentPage = totalPages;

  // Paginate
  const startIndex = (currentPage-1)*count;
  const endIndex = currentPage*count;
  return {
    page: currentPage,
    totalPages,
    elementsPerPage: count,
    totalElements: data.length,
    data: data.slice(startIndex, endIndex),
  };
};


/**
 * Sort an array of data alphabetically
 * @param {SortParameters} parameters
 * @param {string} order: sort order (asc or desc)
 * @return {any[]}: Sorted data
 */
export const sortData = (parameters : SortParameters)=>{
  const {key, data, order} = parameters;
  if (!Array.isArray(data)) throw new Error("Data must be an array");
  if (!key) throw new Error("Parameter to sort is required");

  const NOT_DEFAULT_SORT_ORDER = "desc";
  // Function to sort alphabetically
  const compare = (prop: string | number) =>
    (a: any, b: any) =>{
      if (a[prop] > b[prop]) return order !== NOT_DEFAULT_SORT_ORDER? 1 : -1;
      if (b[prop] > a[prop]) return order !== NOT_DEFAULT_SORT_ORDER? -1 : 1;
      return 0;
    };
  // Return sorted data
  return data.sort(compare(key));
};
