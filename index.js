const core = require('@actions/core');
const github = require('@actions/github');
const { exec } = require("child_process");

async function run() {
  exec("url=https://www.12gobiking.nl/ prod=1 npx playwright test", ((error, stdout, stderr) => {
    if (error) {
      core.setFailed(error.message)
      console.log(`Error: ${error.message}`)
    }
    console.log(`stdout: ${stdout}`);
    core.setOutput("result", stdout)
  }))
}