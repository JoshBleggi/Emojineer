const { Router } = require('express');
const urlUtility = require('../../utility/urlUtility.js');

const route = Router();

function configureRoutes(api, emojiHandler) {
  api.use('/emoji', route);

  route.post('/', async (req, res) => {
    console.log(req);

    //Validate parameters were passed
    if (!req.body?.teamId || !req.body.imageUrl || !req.body.emojiName) {
      return res.json({ error: `The destination TeamId, URL to the source image, and the name of the Emoji must be included. Example body:
      {
        "teamId": "T1234567890",
        "imageUrl": "https://www.website.com/image.gif",
        "emojiName": "cool_emoji"
      }` }).status(400);
    }

    // Validate whether URL is in the proper format
    if (!urlUtility.tryParseUrl(req.body.imageUrl)) {
      return res.json({ error: 'Source image URL must be valid' }).status(400);
    }

    await emojiHandler.submitEmojiForApproval(req.body.teamId, req.body.imageUrl, req.body.emojiName);

    return res.status(202).end();
  });

  route.get('/:name', (req, res) => {
    let emojiName = req.params?.name?.toLowerCase();

    if (!emojiName) {
      return res.json({ error: 'An emojiName must be included in the route' }).status(400);
    }

    return res.status(200).end();
  });
}

module.exports = configureRoutes;