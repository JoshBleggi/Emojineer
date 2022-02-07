function view(imageUrl) {
  return {
    blocks: [
     {
       "type": "section",
       "text": {
         "type": "plain_text",
         "text": `Your image is too large for Slack to import automatically. Would you like to modify it?`
       }
     },
     {
      "type": "image",
      "image_url": imageUrl,
      "alt_text": "Possible future Emoji"
     },
     {
       "type": "actions",
       "elements": [
         {
           "type": "button",
           "text": {
             "type": "plain_text",
             "text": "Resize"
           },
           "action_id": "resize",
           "value": imageUrl
         },
         {
           "type": "button",
           "text": {
             "type": "plain_text",
             "text": "Crop"
           },
           "action_id": "crop",
           "value": imageUrl
         },
         {
           "type": "button",
           "text": {
             "type": "plain_text",
             "text": "Reduce Quality"
           },
           "action_id": "reduce_quality",
           "value": imageUrl
         }
       ]
     }
   ]
 };
}

module.exports = { view };