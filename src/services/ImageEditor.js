const sharp = require('sharp');
const tokens = require('../common/tokens.js');
const imageEditingOptions = require('../options/imageEditingOptions.js');

class ImageEditorService {
    imageClient;
    slackClient;

    constructor (imageClient, slackClient) {
        this.imageClient = imageClient;
        this.slackClient = slackClient;
    }

    async resizeToPublicUrl(imageFetchUrl) {
        // Fetch the previous image for editing
        let originalImageBuffer = await this.imageClient.fetchImageAsBuffer(imageFetchUrl);
        
        // Load data into Sharp for resizing
        let modifiedImageBuffer;
        await sharp(originalImageBuffer, imageEditingOptions.options)
        // fit == "inside" constrains the largest dimensions to the ones specified and maintains the aspect ratio of the image
        .resize({ width: 64, height: 64, fit: "inside" }) 
        .toBuffer()
        .then((data) => { 
            modifiedImageBuffer = data;
        });

        // Upload the image so that it can be displayed 
        return await this.uploadImageToPublicURL(modifiedImageBuffer);
    }

    async cropToPublicUrl(imageFetchUrl) {
        // Fetch the previous image for editing
        let originalImageBuffer = await this.imageClient.fetchImageAsBuffer(imageFetchUrl);
        
        // Load data into Sharp for crop
        let modifiedImageBuffer;
        let image = sharp(originalImageBuffer, imageEditingOptions.options);
        let imageMetadata = await image.metadata();
        // Find our minimum constraint for square cropping
        let minDimension = Math.min(imageMetadata.width, imageMetadata.height);

        await image.resize(minDimension, minDimension) // Default crop behavior centers the image
        .toBuffer()
        .then((data) => { 
            modifiedImageBuffer = data;
        });

        // Upload the image so that it can be displayed 
        return await this.uploadImageToPublicURL(modifiedImageBuffer);
    }

    async reduceQualityToPublicUrl(imageFetchUrl) {
        // Fetch the previous image for editing
        let originalImageBuffer = await this.imageClient.fetchImageAsBuffer(imageFetchUrl);
        
        // Load data into Sharp for quality reduction
        let modifiedImageBuffer;
        await sharp(originalImageBuffer, imageEditingOptions.options)
        /* 
        Sharp applies quality modification at the type level. 
        Most common types are listed. 
        Force == false prevents type conversion 
        */
        .jpeg({ quality: 75, force: false })
        .png({ quality: 75, force: false })
        .webp({ quality: 75, force: false })
        .gif({ colours: 128, force: false })
        .toBuffer()
        .then((data) => { 
            modifiedImageBuffer = data;
        });

        // Upload the image so that it can be displayed 
        return await this.uploadImageToPublicURL(modifiedImageBuffer);
    }

    async attemptUpload(urlText, emojiName) {
        try {
            await this.slackClient.admin.emoji.add({
                token: tokens.userToken,
                url: urlText,
                name: emojiName
            });
            return 'success'
        } 
        catch (err) { 
            //Return a DTO to the caller to simplify handling logic
            switch (err.data.error) {
                case 'resized_but_still_too_large':
                case 'error_too_big':
                case 'error_bad_wide':
                    return 'image_too_large_error';
                case 'error_bad_name_i18n':
                case 'error_name_taken':
                case 'error_name_taken_i18n':
                    return 'name_error';
                case 'no_image_uploaded':
                    return 'no_image_error'
                default:
                console.error(err);
                    return 'unknown_error'
            }
        }
    }

    uploadImageToPublicURL = async function(buffer) {    
        //Following unofficial method of resharing a method without making it public https://stackoverflow.com/a/58189401/1413199
        let uploadResult = await this.slackClient.files.upload({
            token: tokens.userToken,
            file: buffer
        });
        
        let shareResult = await this.slackClient.files.sharedPublicURL({
            token: tokens.userToken,
            file: uploadResult.file.id
        });
        
        return this.constructDirectImageURLFromFile(shareResult.file).toString();
    }
    
    constructDirectImageURLFromFile = function(file) {
        //Following unofficial method of constructing direct link to image https://stackoverflow.com/a/57254520/1413199
        let permalinkElements = file.permalink_public.split('-');
        //Creating a URL will throw a more relevant exception than allowing the view to fail when it tries to get the image if something goes wrong
        return new URL(`${file.url_private}?pub_secret=${permalinkElements[permalinkElements.length - 1]}`)
    }
}

module.exports = ImageEditorService;