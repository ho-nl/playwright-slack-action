const core = require('@actions/core');
const github = require('@actions/github');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { WebClient } = require('@slack/web-api');

async function run() {
  const web = new WebClient(core.getInput('slack-token'));
  exec("url=https://www.12gobiking.nl/ prod=1 npx playwright test compare-servers.test.ts").then((stdout, stderr) => {
    if (stderr) {
      core.setFailed(stderr)
      web.chat.postMessage({
        text: stderr,
        channel: core.getInput('slack-channel'),
      });
    } else {
      web.chat.postMessage({
        text: stdout,
        channel: core.getInput('slack-channel'),
      });
    }
    core.setOutput('result', stdout)
  })

}

run()
