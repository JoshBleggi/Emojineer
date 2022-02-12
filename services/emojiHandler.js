const ownerImageEditingView = require('../views/ownerImageEditingView.js');

const userToken = process.env.SLACK_USER_TOKEN;

class EmojiHandler {
    slackClient;

    constructor(slackClient) {
        this.slackClient = slackClient;
    }

    async submitEmojiForApproval(teamId, imageUrl, emojiName) {
        let userList = await this.slackClient.users.list({ "team_id": teamId });
        let primaryOwner = userList.members.filter(function(user) {
            return user.is_primary_owner;
        })[0];

        let channelId = (await this.slackClient.conversations.open({ 
            "users": primaryOwner.id,
            "return_im": false
        })).channel.id;

        await this.slackClient.chat.postEphemeral({
            channel: channelId,
            user: primaryOwner.id,
            text: `An image has been submitted under the name :${emojiName}:`,
            blocks: ownerImageEditingView.view(imageUrl, emojiName)
        });
    }

    async getEmoji(emojiName) {
        return (await this.slackClient.admin.emoji.list({ token: userToken })).emoji[emojiName];
    }
}

module.exports = EmojiHandler;