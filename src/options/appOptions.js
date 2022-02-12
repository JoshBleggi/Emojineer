const options = {
    socketMode: true,
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    WebClientOptions: {
        /*Done to cut down on latency when attempting to upload an image that ends up being too large. I'd like to avoid this
          but I haven't been able to figure out the pattern for using https://github.com/tim-kos/node-retry#retryoperationoptions at the moment*/
        retryConfig: { retries: 0 } 
    }
}

module.exports = { options };