# Emojineer
A Slack App that allows users to edit emojis as they are imported

# Overview
Slack is a highly extensible workspace for teams to collaborate on. Its value to Enterprise companies is enhanced when it drives employee engagement. Employees who are engaged are more innovative, less likely to leave their current job, and drive higher earnings per share ([Source](https://www2.deloitte.com/content/dam/Deloitte/us/Documents/human-capital/us-cons-culturepath-culture-vs-engagement.pdf)). Social Media researchers have found the use of Emojis [increases engagement](https://www.socialmediatoday.com/news/using-emojis-in-social-media-marketing-infographic/573673/). Emojineer helps make the task of adding Emojis to your Slack Enterprise Grid Workspace easy and manageable.

## Features
Emojineer helps automate the most common tasks associated with importing Emojis into your workspace.

### Adding Emojis to Slack
Emojineer exposes two methods of adding Emojis to your workspace. 

#### Slash Command
The first is through use of the simple slash command "/addemoji [URL] [EmojiName]". Emojineer will validate the payload sent and provide the users with options to edit the image. Once the image is to the user's liking, they can upload it to Slack's library if they have Admin permissions or submit it to the workspace's primary owner if they are not.

#### API
Alternatively, Emojineer exposes a Express.JS HTTP endpoint. A user may POST to the /Emoji endpoint and will receive a 202 if the request succeeds, indicating that the Emoji has been sent to the workspace's primary owner for editing and approval.

Example Request Body:
```JSON
{
	"teamId": "T1234ABCDF",
	"imageUrl": "https://www.website.com/image.gif",
	"emojiName": "cool_emoji"
}
```

The API also exposes a GET /Emoji/[Name] Endpoint that can be used to later provide information on whether the Emoji has been added to the Workspace Library

## Architecture
![alt text](https://github.com/JoshBleggi/Emojineer/blob/main/Diagrams/Architecture%20Overview.png?raw=true "Architecture Overview")

## Interaction Flow
![alt text](https://github.com/JoshBleggi/Emojineer/blob/main/Diagrams/Interaction%20Design.png?raw=true "Interaction Overview")

# Configuration
Emojineer is a product in development. As such, it is not currently hosted on the Slack App Store and has only been preconfigured to run in Socket Mode when communicating with Slack Workspaces. 

## Enterprise Grid Note
Because Emojineer requires admin.teams related privelages, users should be aware that Emojineer is only available for [Slack Enterprise Grid](https://slack.com/enterprise) customers. Prospective users may submit an [Enterprise Grid Sandbox Request](https://docs.google.com/forms/d/e/1FAIpQLSe9tIHOq1bZVq5xlzymvPGFbqsv2aLFgg04SOi5KfzKbJYBAA/viewform) if they have not already purchased Enterprise Grid.

## Slack Workspace Configuration
Beta users who desire to test the app should find the Emojineer [manifest.yaml](https://github.com/JoshBleggi/Emojineer/blob/main/manifest.yaml) and refer to the [Official Slack Documentation](https://api.slack.com/reference/manifests) on using it to create an App in their dashboard. Add a [Slash Command](https://api.slack.com/interactivity/slash-commands) to your app for "/addemoji [URL] [EmojiName]". Once configuration is complete, [install Emojineer to your Organization](https://slack.com/help/articles/360000281563-Manage-apps-on-Enterprise-Grid).

## Environment Configuration
Emojineer uses Bot, App, and User [access tokens](https://api.slack.com/authentication/token-types). Set the following environment variables in where you will be running it:
```
SLACK_USER_TOKEN
SLACK_BOT_TOKEN
SLACK_APP_TOKEN
```

By default, Emojineer exposes the WebSocket connection it uses for Slack Workspace communication on port 3000 and its Express.js API on 3001. To configure these you may set the following environment variables:
```
APP_PORT
API_PORT
```
