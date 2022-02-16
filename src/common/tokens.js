//https://api.slack.com/authentication/token-types
const userToken = process.env.SLACK_USER_TOKEN;
const botToken = process.env.SLACK_BOT_TOKEN;
const appToken = process.env.SLACK_APP_TOKEN;

module.exports = { userToken, botToken, appToken };