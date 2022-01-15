/**
 * Custom functions for express usage
 */
import {Response} from "express";

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
