const { App } = require('@slack/bolt');
const sharp = require('sharp');
const axios = require('axios')
const imageEditingView = require('./views/imageEditingView.js')
const imageEditingOptions = require('./options/imageEditingOptions.js')
const appOptions = require('./options/appOptions.js')
const urlUtility = require('./utility/urlUtility.js')

/* This class is the entrypoint for the App */

// Initialize app with tokens
const app = new App(appOptions.options);

app.command('/addemoji', async ({ payload, ack, respond }) => {
  // Acknowledge command request
  await ack();

  //Validate text was passed
  if (!payload.text) {
    await respond(`A URL to the source image must be included`);
    return;
  }

  //Validate whether URL is in the proper format
  let urlRef = { 
    url: ""
  };
  if (!urlUtility.tryParseUrl(payload.text, urlRef)) {
    await respond(`Source image URL must be valid`);
    return;
  }
  
  try {
    await imageTooLarge(respond, urlRef.url);
  }
  catch (ex) {
    await respond(`Something went wrong. Please make sure your URL redirects to an image.`);
  }
});

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

        var publicImageURL = await urlUtility.uploadImageToPublicURL(client, buffer);
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

        var publicImageURL = await urlUtility.uploadImageToPublicURL(client, buffer);
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

        var publicImageURL = await urlUtility.uploadImageToPublicURL(client, buffer);
        imageTooLarge(respond, publicImageURL);
      });
    })
  }
  catch (err) {
    respond(`An error was experienced during the operation: ${err}`)
  }
});

async function imageTooLarge(respond, imageUrl) {
  await respond(imageEditingView.view(imageUrl));
}

async function deleteOriginalEphemeralMessage(respond) {
  await respond({
    "response_type" : "ephemeral",
    "delete_original" : true
  })
}

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('🧪 Emojineer is running!');
})();