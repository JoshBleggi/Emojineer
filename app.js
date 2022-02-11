const { App } = require('@slack/bolt');
const appOptions = require('./options/appOptions.js');
const subscribers = require('./subscribers');

// Initialize app with tokens
const app = new App(appOptions.options);
subscribers(app);

// Entrypoint into the app
(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('🧪 Emojineer is running!');
})();