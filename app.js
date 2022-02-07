const { App } = require('@slack/bolt');
const sharp = require('sharp');
const axios = require('axios')
const imageEditingView = require('./views/imageEditingView.js')
const imageEditingOptions = require('./options/imageEditingOptions.js')
const appOptions = require('./options/appOptions.js')

// Entrypoint for App
// Initialize app with tokens
const app = new App(appOptions.options);

const userToken = process.env.SLACK_USER_TOKEN;

app.command('/addemoji', async ({ payload, ack, respond }) => {
  // Acknowledge command request
  await ack();

  if (!payload.text) {
    await respond(`A URL to the source image must be included`);
    return;
  }

  let sourceUri;
  try {
    sourceUri = new URL(payload.text);
  }
  catch (ex) {
    await respond(`Source image URL must be valid`);
    return;
  }
  
  try {
    await imageTooLarge(respond, sourceUri);
  }
  catch (ex) {
    await respond(`Something went wrong. Please make sure your URL redirects to an image.`);
  }
});

async function imageTooLarge(respond, imageUri) {
  await respond(imageEditingView.view(imageUri));
}

app.action('resize', async ({ payload, client, ack, respond }) => {
  await ack();
  await deleteOriginalEphemeralMessage(respond);
  
  try {
    axios.get(payload.value, {
      responseType: 'arraybuffer'
    })
    .then(res => {
      var imageBuffer = Buffer.from(res.data, 'binary');
      sharp(imageBuffer, imageEditingOptions.options)
      .resize({ width: 128, height: 128, fit: "inside" })
      .toBuffer(async (err, buffer) => { 
        if (err) {
          throw err;
        }

        var publicImageURL = await uploadImageToPublicURL(client, buffer);
        imageTooLarge(respond, publicImageURL);
      });
    })
  }
  catch (err) {
    respond(`An error was experienced during the operation: ${err}`)
  }
});

app.action('crop', async ({ payload, client, ack, respond }) => {
  await ack();
  await deleteOriginalEphemeralMessage(respond);
  
  try {
    axios.get(payload.value, {
      responseType: 'arraybuffer'
    })
    .then(async (res) => {
      var imageBuffer = Buffer.from(res.data, 'binary');
      
      var image = sharp(imageBuffer, imageEditingOptions.options);
      var imageMetadata = await image.metadata();
      var minDimension = Math.min(imageMetadata.width, imageMetadata.height);

      image.resize(minDimension, minDimension)
      .toBuffer(async (err, buffer) => { 
        if (err) {
          throw err;
        }

        var publicImageURL = await uploadImageToPublicURL(client, buffer);
        imageTooLarge(respond, publicImageURL);
      });
    })
  }
  catch (err) {
    respond(`An error was experienced during the operation: ${err}`)
  }
});

app.action('reduce_quality', async ({ payload, client, ack, respond }) => {
  await ack();
  await deleteOriginalEphemeralMessage(respond);
  
  try {
    axios.get(payload.value, {
      responseType: 'arraybuffer'
    })
    .then(async (res)  => {
      var imageBuffer = Buffer.from(res.data, 'binary');
      sharp(imageBuffer, imageEditingOptions.options)
      .jpeg({ quality: 75, force: false })
      .png({ quality: 75, force: false })
      .webp({ quality: 75, force: false })
      .gif({ colours: 128, force: false })
      .toBuffer(async (err, buffer) => { 
        if (err) {
          throw err;
        }

        var publicImageURL = await uploadImageToPublicURL(client, buffer);
        imageTooLarge(respond, publicImageURL);
      });
    })
  }
  catch (err) {
    respond(`An error was experienced during the operation: ${err}`)
  }
});

async function deleteOriginalEphemeralMessage(respond) {
  await respond({
    "response_type" : "ephemeral",
    "delete_original" : true
  })
}

async function uploadImageToPublicURL(client, buffer) {
  //Following unofficial method of resharing a method without making it public https://stackoverflow.com/a/58189401/1413199
  let uploadResult = await client.files.upload({
    token: userToken,
    file: buffer
  });

  let shareResult = await client.files.sharedPublicURL({
    token: userToken,
    file: uploadResult.file.id
  });

  return constructDirectImageURLFromFile(shareResult.file);
}

function constructDirectImageURLFromFile(file) {
  //Following unofficial method of constructing direct link to image https://stackoverflow.com/a/57254520/1413199
  var permalinkElements = file.permalink_public.split('-');
  return new URL(`${file.url_private}?pub_secret=${permalinkElements[permalinkElements.length - 1]}`)
}

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();