/**
 * This files parses the environment variables to work properly with TypeScript
 *
 * Source: https://dev.to/asjadanis/parsing-env-with-typescript-3jjm
 *
 * IMPORTANT: After adding a field to .env file you need to add it to ENV and Config interfaces
 * and getConfig function in this file
 */
import path from "path";
import dotenv from "dotenv";

// Parsing the env file.
dotenv.config({path: path.resolve(__dirname, "../../.env")});

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these variables or not setup a .env file at all

interface ENV {
  NODE_ENV: string | undefined;
  PORT: number | undefined;
}

interface Config {
  NODE_ENV: string;
  PORT: number;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
  return {
    NODE_ENV: process.env.NODE_ENV ? process.env.NODE_ENV : "development",
    PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
  };
};

// Throwing an Error if any field was undefined we don't
// want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type
// definition.

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in .env or its configuration`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
