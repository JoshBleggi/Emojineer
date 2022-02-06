const { App } = require('@slack/bolt');

// Entrypoint for App
// Initialize app with tokens
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

const uriRegex = /^(ftp|http|https):\/\/[^ "]+$/;

app.command('/addemoji', async ({ payload, ack, respond }) => {
  // Acknowledge command request
  await ack();

  if (!payload.text || !payload.text.match(uriRegex)) {
    await respond(`A valid URI to the source image must be included`);
    return;
  }
  await imageTooLarge(respond);
  
});

async function imageTooLarge(respond) {
  await respond({
    blocks: [
     {
       "type": "section",
       "text": {
         "type": "plain_text",
         "text": `Your image is too large for Slack to import automatically. Would you like to modify it?`
       }
     },
     {
       "type": "actions",
       "elements": [
         {
           "type": "button",
           "text": {
             "type": "plain_text",
             "text": "Resize"
           },
           "action_id": "resize"
         },
         {
           "type": "button",
           "text": {
             "type": "plain_text",
             "text": "Reduce Quality"
           },
           "action_id": "reduce_quality"
         },
         {
           "type": "button",
           "text": {
             "type": "plain_text",
             "text": "Crop"
           },
           "action_id": "crop"
         },
         {
           "type": "button",
           "text": {
             "type": "plain_text",
             "text": "Remove Frames"
           },
           "action_id": "remove_frames"
         }
       ]
     }
   ]
 });
}


app.action('resize', async ({ ack, respond }) => {
  await ack();
  await deleteOriginalEphemeralMessage(respond);
});

app.action('reduce_quality', async ({ ack, respond }) => {
  await ack();
  await deleteOriginalEphemeralMessage(respond);
});

app.action('crop', async ({ ack, respond }) => {
  await ack();
  await deleteOriginalEphemeralMessage(respond);
});

app.action('remove_frames', async ({ ack, respond }) => {
  await ack();
  await deleteOriginalEphemeralMessage(respond);
});

async function deleteOriginalEphemeralMessage(respond) {
  await respond({
    "response_type" : "ephemeral",
    "delete_original" : true
  })
}

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();