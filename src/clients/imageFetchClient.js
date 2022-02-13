class ImageClient {
    client;

    constructor(client) {
        this.client = client;
    }

    async fetchImageAsBuffer(imageUrlString) {
        let imageBuffer;

        await this.client.get(imageUrlString, {
            responseType: 'arraybuffer'
        })
        .then((res) => {
            // Buffer data
            imageBuffer = Buffer.from(res.data, 'binary');
        });

        return imageBuffer;
    }
}

module.exports = ImageClient;