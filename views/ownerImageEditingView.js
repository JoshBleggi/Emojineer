function view(channelId, urlText, emojiName) {
  var payload = `${urlText} ${emojiName}`;
  return {
    channel: channelId,
    blocks: [
     {
       "type": "section",
       "text": {
         "type": "plain_text",
         "text": `An image has been submitted under the name :${emojiName}:. Please select an action.`
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
             "text": "Approve"
           },
           "style": "primary",
           "action_id": "approve",
           "value": payload
         },
         {
           "type": "button",
           "text": {
             "type": "plain_text",
             "text": "Deny"
           },
           "style": "danger",
           "action_id": "deny",
           "value": payload
         }
       ]
     }
   ]
 };
}

module.exports = { view };