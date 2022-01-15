// Environment variables configuration and loader
import {env} from "./config";
// Express APP
import {serverApp} from "./index";

serverApp.listen(env.PORT??3000, ()=>{
  console.log("\x1b[33m[EXPRESS-SERVER] %s\x1b[0m", "Starting server...");
  console.log("\x1b[33m[EXPRESS-SERVER] %s\x1b[0m \x1b[36m%s\x1b[0m ", "Listening on port:", `${env.PORT??3000}`);
});
