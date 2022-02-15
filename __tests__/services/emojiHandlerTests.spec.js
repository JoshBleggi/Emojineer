const emojiHandlerClass = require('../../src/services/emojiHandler.js');

const testEmojiName = 'cool_emoji_name';
const testEmojiBody = {
    "url": "https://www.coolemoji.com/image.gif",
    "date_created": 1644449308,
    "uploaded_by": "U1111AAAA"
};

const postEphemeralSpy = jest.fn(() => {})
const mockClient = {
    users: {
        list: jest.fn(() => {
            return {
                members: [
                    {
                        id: "1234",
                        is_primary_owner: false
                    },
                    {
                        id: "5678",
                        is_primary_owner: true
                    },
                    {
                        id: "ABCD",
                        is_primary_owner: false
                    }
                ]
            }
        })
    },
    conversations: {
        open: jest.fn(() => {
            return {
                channel: {
                    id: "T1241541"
                }
            }
        })
    },
    chat: {
        postEphemeral: postEphemeralSpy
    },
    admin: {
        emoji: {
            list: jest.fn(() => {
                return {
                    emoji: { 
                        "bad_emoji": {
                            "url": "https://www.bademoji.com/image.gif",
                            "date_created": 1644444758,
                            "uploaded_by": "U1234ABCD"
                        },
                        [testEmojiName]: testEmojiBody,
                        "weird_emoji": {
                            "url": "https://www.donotwant.com/image.gif",
                            "date_created": 1645532154,
                            "uploaded_by": "U1554AQCD"
                        },
                    }
                }
            })
        }
    }
}

const testService = new emojiHandlerClass(mockClient);

describe('EmojiHandler', () => {
    test('Submit emoji to primary owner', async () => {
        await testService.submitEmojiForApproval('teamId', 'urlText', testEmojiName);
        expect(postEphemeralSpy).toHaveBeenCalledTimes(1);
    });
    
    test('Get emoji from library', async () => {
        let result = await testService.getEmoji(testEmojiName);
        expect(result).toEqual(testEmojiBody);
    });
});