const ownerImageEditingView = require('../views/ownerImageEditingView.js');
const tokens = require('../common/tokens.js');

class EmojiHandler {
    slackClient;

    constructor(slackClient) {
        this.slackClient = slackClient;
    }

    async submitEmojiForApproval(teamId, imageUrl, emojiName) {
        //Find the primary owner of the team
        let userList = await this.slackClient.users.list({ "team_id": teamId });
        let primaryOwner = userList.members.filter(function(user) {
            return user.is_primary_owner;
        })[0];

        //Open a DM with them
        let channelId = (await this.slackClient.conversations.open({ 
            "users": primaryOwner.id,
            "return_im": false
        })).channel.id;

        //Message them the editing view ephemerally
        await this.slackClient.chat.postEphemeral({
            channel: channelId,
            user: primaryOwner.id,
            text: `An image has been submitted under the name :${emojiName}:`,
            blocks: ownerImageEditingView.view(imageUrl, emojiName)
        });
    }

    async getEmoji(emojiName) {
        //Simply return the information on the Emoji if it exists.
        return (await this.slackClient.admin.emoji.list({ token: tokens.userToken })).emoji[emojiName];
    }
}

module.exports = EmojiHandler;