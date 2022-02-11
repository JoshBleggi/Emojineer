const { App } = require('@slack/bolt');
const express = require('express');
const bodyParser = require('body-parser');
const appOptions = require('./options/appOptions.js');
const subscribers = require('./subscribers');
const emojiController = require('./api/routes/emoji.js');
const emojiHandlerClass = require('./services/emojiHandler.js');

// Initialize app with tokens
const app = new App(appOptions.options);
subscribers(app);

const emojiHandler = new emojiHandlerClass(app.client);

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