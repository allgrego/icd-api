/**
 * Miscellaneous functions
 * @author: Gregorio Alvarez <allgrego14@gmail.com>
 */

/**
 * Makes a pause for ms milliseconds
 * @param {number} ms: Milliseconds to wait
 * @return {void}
 */
export const delay = (ms: number) : Promise<void> => new Promise((resolve)=>setTimeout(resolve, ms));

/**
 * Roman numerals Object from 1 to 22
 */
export const romanNumerals : Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
  10: "X",
  11: "XI",
  12: "XII",
  13: "XIII",
  14: "XIV",
  15: "XV",
  16: "XVI",
  17: "XVII",
  18: "XVIII",
  19: "XIX",
  20: "XX",
  21: "XXI",
  22: "XXII",
};
