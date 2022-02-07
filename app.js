const { App } = require('@slack/bolt');
const sharp = require('sharp');
const axios = require('axios')
const imageEditingView = require('./views/imageEditingView.js')
const imageEditingOptions = require('./options/imageEditingOptions.js')
const appOptions = require('./options/appOptions.js')
const urlUtility = require('./utility/urlUtility.js')

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

  // Validate whether URL is in the proper format
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
  // Acknowledge command request
  await ack();
  // Delete the message that was clicked
  await deleteOriginalEphemeralMessage(respond);
  
  try {
    // Fetch the previous image for editing
    axios.get(payload.value, {
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
  // Acknowledge command request
  await ack();
  // Delete the message that was clicked
  await deleteOriginalEphemeralMessage(respond);
  
  try {
    // Fetch the previous image for editing
    axios.get(payload.value, {
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
  // Acknowledge command request
  await ack();
  // Delete the message that was clicked
  await deleteOriginalEphemeralMessage(respond);
  
  try {
    // Fetch the previous image for editing
    axios.get(payload.value, {
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

// Entrypoint into the app
(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('🧪 Emojineer is running!');
})();