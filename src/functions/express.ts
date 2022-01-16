/**
 * Custom functions for express usage
 */
import {Request, Response} from "express";

/**
 * Send a JSON error response to client
 * @param {Response} res: Express response object
 * @param {number} code: http status code to send (200,404,400,etc)
 * @param {string} status: code for error to display
 * @param {string} message: message to display in error
 * @return {void}
 */
export const resError =(res: Response, code:number, status: string, message: string) : void => {
  res.status(code).json({
    error: {
      status: status,
      message: message,
    },
  });
  return;
};

/**
 * Provide usual parameters for data pagination in express
 * @param {Request} req: Express request object
 * @param {number} defaultCount
 * @param {string} defaultSort
 * @return {any}
 */
export const getRequestPaginationParameters = (req: Request, defaultCount : number = 20) =>{
  // Current page (1 if not number provided)
  const page = Number(req.query.page) || 1;
  // Elements per page (defaultCount if not number)
  const count = Number(req.query.count)||defaultCount;
  return {
    page,
    count,
  };
};

export const getRequestSortParameters = (req: Request, data: any[], key?: string, defaultSort? : string) => {
  const SORT_OPTIONS : Record<string, string>= {
    asc: "asc",
    desc: "desc",
  };
  const INNER_DEFAULT_SORT = SORT_OPTIONS.asc;
  // Data order (asc or desc)
  const order = SORT_OPTIONS[String(req.query.order)]||defaultSort||INNER_DEFAULT_SORT;
  // Default sortBy is index 0
  let sortBy : string | number = key || 0;
  // If data is a non empty array
  if (Array.isArray(data)&&data.length) {
    // Check which keys are valid for provided Data
    const validKeys = Object.keys(data[0]);
    // Get sortBy key provided by client
    const providedSortBy = String(req.query.sortBy);
    // Select the client key if it's valid, otherwise select the first one of the valid ones
    sortBy = validKeys.includes(providedSortBy)? providedSortBy:validKeys[0];
  }
  return {
    order,
    key: sortBy,
    data,
  };
};

export const stdRouteNotFound = (res: Response) : void =>{
  res.status(404).json({
    error: {
      status: "not-found",
      message: "Invalid route",
    },
  });
  return;
};
