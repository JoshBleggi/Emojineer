const tokens = require('../common/tokens.js');

const options = {
    socketMode: true,
    token: tokens.botToken,
    appToken: tokens.appToken,
    WebClientOptions: {
        /*Done to cut down on latency when attempting to upload an image that ends up being too large. I believe using 
        https://github.com/tim-kos/node-retry#retryoperationoptions is key but haven't been able to figure it out at the moment*/
        retryConfig: { retries: 0 } 
    }
}

module.exports = { options };