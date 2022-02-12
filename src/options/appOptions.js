const tokens = require('../common/tokens.js');

const options = {
    socketMode: true,
    token: tokens.botToken,
    appToken: tokens.appToken,
    WebClientOptions: {
        /*Done to cut down on latency when attempting to upload an image that ends up being too large. I'd like to avoid this
          but I haven't been able to figure out the pattern for using https://github.com/tim-kos/node-retry#retryoperationoptions at the moment*/
        retryConfig: { retries: 0 } 
    }
}

module.exports = { options };