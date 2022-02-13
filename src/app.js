const { App } = require('@slack/bolt');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const appOptions = require('./options/appOptions.js');
const ImageFetchClient = require('./clients/imageFetchClient.js');
const subscribers = require('./subscribers');
const emojiController = require('./api/routes/emoji.js');
const emojiHandlerClass = require('./services/emojiHandler.js');
const ImageEditorService = require('./services/imageEditor.js');

// Initialize app with tokens
const app = new App(appOptions.options);

//Rudamentary dependency injection. Could be replaced by dedicated library.
const imageClient = new ImageFetchClient(axios);

const imageEditor = new ImageEditorService(imageClient, app.client);
const emojiHandler = new emojiHandlerClass(app.client);
subscribers(app, imageEditor, emojiHandler);

const api = new express();
api.use(
  express.urlencoded({
    extended: true
  })
)
api.use(bodyParser.json())
emojiController(api, emojiHandler);

// Entrypoint into the app
(async () => {
  // Start your app
  await app.start(process.env.APP_PORT || 3000);

  console.log('🧪 Emojineer is running!');

  api.listen(process.env.API_PORT || 3001, () => {
    console.log('💻 API is active!');
  });
})();