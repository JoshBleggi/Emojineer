const sharp = require('sharp');
const axios = require('axios');
const userImageEditingView = require('../views/userImageEditingView.js');
const ownerImageEditingView = require('../views/ownerImageEditingView.js');
const imageEditingOptions = require('../options/imageEditingOptions.js');
const urlUtility = require('../utility/urlUtility.js');

const userToken = process.env.SLACK_USER_TOKEN;

function loadListeners(app) {
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
        // Fetch the previous image for editing
        axios.get(params.urlText, {
        responseType: 'arraybuffer'
        })
        .then((res) => {
        // Buffer data
        var imageBuffer = Buffer.from(res.data, 'binary');

        // Load data into Sharp for resizing
        sharp(imageBuffer, imageEditingOptions.options)
        // fit == "inside" constrains the largest dimensions to the ones specified and maintains the aspect ratio of the image
        .resize({ width: 128, height: 128, fit: "inside" }) 
        .toBuffer(async (err, buffer) => { 
            if (err) {
            throw err;
            }

            // Upload the image so that it can be displayed 
            var imageUrlString = await urlUtility.uploadImageToPublicURL(client, buffer);

            await imageModificationResponse(client, respond, body.user.id, imageUrlString, params.emojiName);
        });
        })
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
        // Fetch the previous image for editing
        axios.get(params.urlText, {
        responseType: 'arraybuffer'
        })
        .then(async (res) => {
        // Buffer data
        var imageBuffer = Buffer.from(res.data, 'binary');
        
        // Load data into Sharp for crop
        var image = sharp(imageBuffer, imageEditingOptions.options);
        var imageMetadata = await image.metadata();
        // Find our minimum constraint for square cropping
        var minDimension = Math.min(imageMetadata.width, imageMetadata.height);

        image.resize(minDimension, minDimension) // Default crop behavior centers the image
        .toBuffer(async (err, buffer) => { 
            if (err) {
            throw err;
            }

            // Upload the image so that it can be displayed 
            var imageUrlString = await urlUtility.uploadImageToPublicURL(client, buffer);

            await imageModificationResponse(client, respond, body.user.id, imageUrlString, params.emojiName);
        });
      })
    }
    catch (err) {
        respond(`An error was experienced during the operation: ${err}`)
    }
    });

    app.action('reduce_quality', async ({ payload, body, client, ack, respond }) => {
    // Acknowledge command request
    await ack();
    // Delete the message that was clicked
    await deleteOriginalEphemeralMessage(respond);
    
    let params = parseParams(payload.value);
    try {
        // Fetch the previous image for editing
        axios.get(params.urlText, {
        responseType: 'arraybuffer'
        })
        .then(async (res)  => {
        // Buffer data
        var imageBuffer = Buffer.from(res.data, 'binary');

        // Load data into Sharp for quality reduction
        sharp(imageBuffer, imageEditingOptions.options)
        /* 
        Sharp applies quality modification at the type level. 
        Most common types are listed. 
        Force == false prevents type conversion 
        */
        .jpeg({ quality: 75, force: false })
        .png({ quality: 75, force: false })
        .webp({ quality: 75, force: false })
        .gif({ colours: 128, force: false })
        .toBuffer(async (err, buffer) => { 
            if (err) {
            throw err;
            }

            // Upload the image so that it can be displayed 
            var imageUrlString = await urlUtility.uploadImageToPublicURL(client, buffer);

            await imageModificationResponse(client, respond, body.user.id, imageUrlString, params.emojiName);
        });
        })
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
    await attemptUpload(client, respond, body.user.id, params.urlText, params.emojiName);
  });

  app.action('submit', async ({ payload, body, ack, respond }) => {
    // Acknowledge command request
    await ack();
    // Delete the message that was clicked
    await deleteOriginalEphemeralMessage(respond);
    
    let params = parseParams(payload.value);
    //TODO: First param should be TeamId
    await emojiHandler.submitEmojiForApproval(body.user.id, params.urlText, params.emojiName);
  });

  app.action('cancel', async ({ ack, respond }) => {
    // Acknowledge command request
    await ack();
    // Delete the message that was clicked
    await deleteOriginalEphemeralMessage(respond);
  });
}

async function attemptUpload(client, respond, userId, urlText, emojiName) {
  try {
    await client.admin.emoji.add({
      token: userToken,
      url: urlText,
      name: emojiName
    });
    await respond('Emoji uploaded successfully');
    return;
  } catch (err) { 
    switch (err.data.error) {
      case 'resized_but_still_too_large':
      case 'error_too_big':
      case 'error_bad_wide':
        await imageModificationResponse(client, respond, userId, urlText, emojiName);
        break;
      case 'error_bad_name_i18n':
      case 'error_name_taken':
      case 'error_name_taken_i18n':
        await respond('There was an issue with the provided name. Please choose another');
        break;
      case 'no_image_uploaded':
        await respond('No image was found at the provided URL. Please make sure it is the public URL of an image');
        break;
      default:
        await respond('An unknown error occurred while attempting to add the emoji');
        console.error(err);
    }
  }
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