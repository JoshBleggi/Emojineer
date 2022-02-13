const userImageEditingView = require('../views/userImageEditingView.js');
const ownerImageEditingView = require('../views/ownerImageEditingView.js');
const urlUtility = require('../common/urlUtility.js');

function loadListeners(app, imageEditor, emojiHandler) {
  app.command('/addemoji', async ({ payload, body, client, ack, respond }) => {
    // Acknowledge command request
    await ack();

    let params = parseParams(payload.text);
    //Validate text was passed
    if (!params?.urlText || !params.emojiName) {
        await respond('A URL to the source image and the name of the Emoji must be included.\nProper usage: \'/addemoji [imageUrl] [emojiName]\'');
        return;
    }

    // Validate whether URL is in the proper format
    if (!urlUtility.tryParseUrl(params.urlText)) {
        await respond('Source image URL must be valid');
        return;
    }

    await imageModificationResponse(client, respond, body.user_id, params.urlText, params.emojiName);
  });

  app.action('resize', async ({ payload, body, client, ack, respond }) => {
    // Acknowledge command request
    await ack();
    // Delete the message that was clicked
    await deleteOriginalEphemeralMessage(respond);
    
    let params = parseParams(payload.value);
    try {
      let imageUrlString = await imageEditor.resizeToPublicUrl(params.urlText);

      await imageModificationResponse(client, respond, body.user.id, imageUrlString, params.emojiName);
    }
    catch (err) {
      respond(`An error was experienced during the operation: ${err}`)
    }
  });

  app.action('crop', async ({ payload, body, client, ack, respond }) => {
    // Acknowledge command request
    await ack();
    // Delete the message that was clicked
    await deleteOriginalEphemeralMessage(respond);

    let params = parseParams(payload.value);
    try {
      let imageUrlString = await imageEditor.cropToPublicUrl(params.urlText);  

      await imageModificationResponse(client, respond, body.user.id, imageUrlString, params.emojiName);
    }
    catch (err) {
        respond(`An error was experienced during the operation: ${err}`);
    }
  });

  app.action('reduce_quality', async ({ payload, body, client, ack, respond }) => {
    // Acknowledge command request
    await ack();
    // Delete the message that was clicked
    await deleteOriginalEphemeralMessage(respond);
    
    let params = parseParams(payload.value);
    try {
      let imageUrlString = await imageEditor.reduceQualityToPublicUrl(params.urlText);  
    
      await imageModificationResponse(client, respond, body.user.id, imageUrlString, params.emojiName);
    }
    catch (err) {
        respond(`An error was experienced during the operation: ${err}`)
    }
  });

  app.action('upload', async ({ payload, body, client, ack, respond }) => {
    // Acknowledge command request
    await ack();
    // Delete the message that was clicked
    await deleteOriginalEphemeralMessage(respond);
    
    let params = parseParams(payload.value);
    let result = await imageEditor.attemptUpload(params.urlText, params.emojiName);
    switch (result) {
      case 'success':
        await respond('Emoji uploaded successfully');
        break;
      case 'image_too_large_error':
        await imageModificationResponse(client, respond, body.user.id, params.urlText, params.emojiName);
        break;
      case 'name_error':
        await respond('There was an issue with the provided name. Please choose another');
        break;
      case 'no_image_error':
        await respond('No image was found at the provided URL. Please make sure it is the public URL of an image');
        break;
      default:
        await respond('An unknown error occurred while attempting to add the emoji');
    }
  });

  app.action('submit', async ({ payload, body, ack, respond }) => {
    // Acknowledge command request
    await ack();
    // Delete the message that was clicked
    await deleteOriginalEphemeralMessage(respond);
    
    let params = parseParams(payload.value);
    //Send to workspace owner for approval
    await emojiHandler.submitEmojiForApproval(body.user.team_id, params.urlText, params.emojiName);
  });

  app.action('cancel', async ({ ack, respond }) => {
    // Acknowledge command request
    await ack();
    // Delete the message that was clicked
    await deleteOriginalEphemeralMessage(respond);
  });
}

async function imageModificationResponse(client, respond, userId, urlText, emojiName) {
  let userIsAdmin = (await client.users.info({ user: userId })).user.is_admin;
  if (userIsAdmin) {
    await respond({
      text: "Edit your image before uploading it to your Emoji Library",
      blocks: ownerImageEditingView.view(urlText, emojiName)
    })
  } else {
    await respond({
      text: "Edit your image before submitting it for approval",
      blocks: userImageEditingView.view(urlText, emojiName)
    });
  }
}

async function deleteOriginalEphemeralMessage(respond) {
  await respond({
    "response_type" : "ephemeral",
    "delete_original" : true
  })
}

function parseParams(payloadText) {
  let splitParams = payloadText?.split(' ');
  return {
    urlText: splitParams[0],
    emojiName: splitParams[1]
  }
}

module.exports = loadListeners;