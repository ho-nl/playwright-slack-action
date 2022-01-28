const core = require('@actions/core');
const github = require('@actions/github');
const { exec } = require("child_process");
const { WebClient } = require('@slack/web-api');

async function run() {
  const web = new WebClient(core.getInput('slack-token'));
  const {error, stdout, stderr} =  await exec("url=https://www.12gobiking.nl/ prod=1 npx playwright test compare-servers.test.ts")

  if (error) {
    core.setFailed(error.message)
    await web.chat.postMessage({
      text: error.message,
      channel: core.getInput('slack-channel'),
    });
  } else {
    await web.chat.postMessage({
      text: stdout,
      channel: core.getInput('slack-channel'),
    });
  }
  core.setOutput('result', stdout)
}

run()
