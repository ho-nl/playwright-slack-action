const fs = require('fs');
const { spawn } = require('child_process');

const core = require('@actions/core');
const { WebClient } = require('@slack/web-api');

async function run() {
  const web = new WebClient(core.getInput('slack-token'));
  const test = spawn('npx', ['playwright', 'test'], { env: { ...process.env, URL: core.getInput('url'), PROD: core.getInput('prod') }});
  let output = ''
  let failedTestOutput = ''
  let failedTests = 0
  let warnings = 0

  test.stdout.on('data', data => {
    core.info(data)
    data = data.toString()
    if (data.includes(`${failedTests + 1})`)) {
      data = data.slice(0, data.search(/\[2m/))
      data = data.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
      failedTestOutput += data + '\n'
      failedTests++
    } else if (data.includes('Warning:')) {
      failedTestOutput += data + '\n'
      warnings += 1
    }
  });

  test.on('close', async () => {
    if (failedTests) {
      const message = await web.chat.postMessage({
        attachments: [{'color': '#cc0000', 'text': `${failedTests} Tests failed :x:`, fallback: `${failedTests} Tests failed :x:`}],
        channel: core.getInput('slack-channel'),
      });
      await web.chat.postMessage({
        text: failedTestOutput,
        channel: core.getInput('slack-channel'),
        thread_ts: message.ts
      })
      if (fs.existsSync('./comparison')) {
        const files = fs.readdirSync('./comparison');
        files.forEach((filename) => {
          web.files.upload({
            channels: core.getInput('slack-channel'),
            thread_ts: message.ts,
            file: fs.createReadStream('./comparison/' + filename)
          })
        })
        core.setFailed('')
      }
    } else if(warnings) {
      const message = await web.chat.postMessage({
        attachments: [{'color': '#ffcc00', 'text': `Tests passed with ${warnings} warnings :warning:`, fallback: `Tests passed with ${warnings} warnings :warning:`}],
        channel: core.getInput('slack-channel'),
      });
      await web.chat.postMessage({
        text: failedTestOutput,
        channel: core.getInput('slack-channel'),
        thread_ts: message.ts
      })
    } else {
      await web.chat.postMessage({
        attachments: [{'color': '#36a64f', 'text': 'All tests passed :white_check_mark:', fallback: 'All tests passed :white_check_mark:'}],
        channel: core.getInput('slack-channel'),
      });
    }
  });
}

run()
