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