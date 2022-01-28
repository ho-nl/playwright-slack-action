const core = require('@actions/core');
const github = require('@actions/github');
const { exec } = require("child_process");
const { WebClient } = require('@slack/web-api');

async function run() {
  const web = new WebClient(core.getInput('slack-token'));
  let testResults = ''
  exec("url=https://www.12gobiking.nl/ prod=1 npx playwright test compare-servers.test.ts", ((error, stdout, stderr) => {
    if (error) {
      core.setFailed(error.message)
      console.log(`Error: ${error.message}`)
    }

    if (stderr) {
      core.setFailed(stderr)
    }

    testResults = stdout
    core.setOutput("result", stdout)
  }))
  const result = await web.chat.postMessage({
    text: testResults,
    channel: core.getInput('slack-channel'),
  });
}

run()
