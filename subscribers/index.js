const sharp = require('sharp');
const axios = require('axios');
const imageEditingView = require('../views/personalImageEditingView.js');
const imageEditingOptions = require('../options/imageEditingOptions.js');
const urlUtility = require('../utility/urlUtility.js');

const userToken = process.env.SLACK_USER_TOKEN;

function loadListeners(app) {
    app.command('/addemoji', async ({ payload, client, ack, respond }) => {
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

    await attemptUpload(client, respond, params.urlText, params.emojiName);
    });

    app.action('resize', async ({ payload, client, ack, respond }) => {
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

            await attemptUpload(client, respond, imageUrlString, params.emojiName);
        });
        })
    }
    catch (err) {
        respond(`An error was experienced during the operation: ${err}`)
    }
    });

    app.action('crop', async ({ payload, client, ack, respond }) => {
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

            await attemptUpload(client, respond, imageUrlString, params.emojiName);
        });
        })
    }
    catch (err) {
        respond(`An error was experienced during the operation: ${err}`)
    }
    });

    app.action('reduce_quality', async ({ payload, client, ack, respond }) => {
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

            await attemptUpload(client, respond, imageUrlString, params.emojiName);
        });
        })
    }
    catch (err) {
        respond(`An error was experienced during the operation: ${err}`)
    }
    });
}

async function attemptUpload(client, respond, urlText, emojiName) {
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
        await imageTooLarge(respond, urlText, emojiName);
        break;
      case 'not_an_admin':
          await respond('You will need to send this emoji to an admin for approval');
          //TODO: Admin stuff
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

async function imageTooLarge(respond, urlText, emojiName) {
  var payload = `${urlText} ${emojiName}`;
  await respond(imageEditingView.view(urlText, payload));
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