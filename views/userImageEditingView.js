function view(imageUrl, emojiName) {
  var payload = `${imageUrl} ${emojiName}`;
  return [
     {
       "type": "section",
       "text": {
         "type": "plain_text",
         "text": `Would you like to modify your image before submitting it for approval? 
A size of 128KB or less is ideal`
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
           "value": payload
         },
         {
           "type": "button",
           "text": {
             "type": "plain_text",
             "text": "Crop"
           },
           "action_id": "crop",
           "value": payload
         },
         {
           "type": "button",
           "text": {
             "type": "plain_text",
             "text": "Reduce Quality"
           },
           "action_id": "reduce_quality",
           "value": payload
         },
         {
           "type": "button",
           "text": {
             "type": "plain_text",
             "text": "Submit"
           },
           "style": "primary",
           "action_id": "submit",
           "value": payload
         },
         {
           "type": "button",
           "text": {
             "type": "plain_text",
             "text": "Cancel"
           },
           "style": "danger",
           "action_id": "cancel",
           "value": payload
         }
       ]
     }
   ];
}

module.exports = { view };