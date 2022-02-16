function view(urlText, emojiName) {
  var payload = `${urlText} ${emojiName}`;
  return [
     {
       "type": "section",
       "text": {
         "type": "plain_text",
         "text": `The following image is being added as an emoji under the name :${emojiName}:
A size of 128kB or less is ideal. Please select an action`
       }
     },
     {
      "type": "image",
      "image_url": urlText,
      "alt_text": "Possible future Emoji"
     },
     {
       "type": "actions",
       "elements": [
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
             "text": "Resize"
           },
           "action_id": "resize",
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
             "text": "Upload"
           },
           "style": "primary",
           "action_id": "upload",
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