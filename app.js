const { App } = require('@slack/bolt');
const express = require('express');
const bodyParser = require('body-parser');
const appOptions = require('./options/appOptions.js');
const subscribers = require('./subscribers');
const emoji = require('./api/routes/emoji.js');

// Initialize app with tokens
const app = new App(appOptions.options);
subscribers(app);

const api = new express();

api.use(
  express.urlencoded({
    extended: true
  })
)

api.use(bodyParser.json())

emoji(app, api);

// Entrypoint into the app
(async () => {
  // Start your app
  await app.start(process.env.APP_PORT || 3000);

  console.log('🧪 Emojineer is running!');

  api.listen(process.env.API_PORT || 3001, () => {
    console.log('💻 API is active!');
  });
})();