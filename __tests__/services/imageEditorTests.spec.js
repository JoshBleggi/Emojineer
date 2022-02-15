const imageEditorService = require('../../src/services/ImageEditor.js');

let webClient;
let mockSlackClient;

describe('imageEditor.attemptUpload', () => {
    test('Upload successfully', async () => {
        mockSlackClient = {
            admin: {
                emoji: {
                    add: jest.fn(() => {})
                }
            }
        }
        const testService = new imageEditorService(webClient, mockSlackClient)
        let result = await testService.attemptUpload('emoji_name');
        expect(result).toEqual('success');
    });
    
    test('Upload failure', async () => {
        mockSlackClient = {
            admin: {
                emoji: {
                    add: jest.fn(() => {
                        throw {
                            data: {
                                error: 'resized_but_still_too_large'
                            }
                        }
                    })
                }
            }
        }
        const testService = new imageEditorService(webClient, mockSlackClient)
        let result = await testService.attemptUpload('emoji_name');
        expect(result).toEqual('image_too_large_error');
    });
});

//ImageEditor is one of the more complex services since it relies on buffered images. I would want to devote a solid amount of time unit testing, with that in mind I decided to get some code coverage up front and knock out the lower hanging fruit.