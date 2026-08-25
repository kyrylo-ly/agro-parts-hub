import { auth } from "../../src/lib/auth";
async function run() {
  console.log("auth object keys:", Object.keys(auth));
}
run();
