const { Router } = require('express');
const urlUtility = require('../../utility/urlUtility.js');

const route = Router();

function configureRoutes(api, emojiHandler) {
  api.use('/emoji', route);

  route.post('/', async (req, res) => {
    console.log(req);

    //Validate parameters were passed
    if (!req.body?.teamId || !req.body.imageUrl || !req.body.emojiName) {
      return res.status(400).json({ error: `The destination TeamId, URL to the source image, and the name of the Emoji must be included. Example body:
      {
        "teamId": "T1234567890",
        "imageUrl": "https://www.website.com/image.gif",
        "emojiName": "cool_emoji"
      }` });
    }

    // Validate whether URL is in the proper format
    if (!urlUtility.tryParseUrl(req.body.imageUrl)) {
      return res.status(400).json({ error: 'Source image URL must be valid' });
    }

    try {
      //Emoji names must be lower case
      await emojiHandler.submitEmojiForApproval(req.body.teamId, req.body.imageUrl, req.body.emojiName.toLowerCase());
    } catch {
      return res.status(500).json({ error: 'An internal server error has occurred' });
    }

    return res.status(202).end();
  });

  route.get('/:name', async (req, res) => {
    let emojiName = req.params?.name?.toLowerCase();

    if (!emojiName) {
      return res.status(400).json({ error: 'An emojiName must be included in the route' });
    }

    let emoji;
    try {
      emoji = await emojiHandler.getEmoji(emojiName);
    } catch {
      return res.status(500).json({ error: 'An internal server error has occurred' });
    }

    if (emoji) {
      return res.status(200).json(emoji);
    }

    return res.status(404).json({ error: 'Resource not found' });
  });
}

module.exports = configureRoutes;