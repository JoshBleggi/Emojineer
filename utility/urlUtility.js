function tryParseUrl(text, urlRef) {
    try {
      urlRef.url = new URL(text);
    }
    catch (ex) {
      return false;
    }
    return true;
}

async function uploadImageToPublicURL(client, buffer) {
    const userToken = process.env.SLACK_USER_TOKEN;

    //Following unofficial method of resharing a method without making it public https://stackoverflow.com/a/58189401/1413199
    let uploadResult = await client.files.upload({
      token: userToken,
      file: buffer
    });
  
    let shareResult = await client.files.sharedPublicURL({
      token: userToken,
      file: uploadResult.file.id
    });
  
    return constructDirectImageURLFromFile(shareResult.file);
  }
  
  function constructDirectImageURLFromFile(file) {
    //Following unofficial method of constructing direct link to image https://stackoverflow.com/a/57254520/1413199
    var permalinkElements = file.permalink_public.split('-');
    //Creating a URL will throw a more relevant exception than allowing the view to fail when it tries to get the image if something goes wrong
    return new URL(`${file.url_private}?pub_secret=${permalinkElements[permalinkElements.length - 1]}`)
  }

  module.exports = { tryParseUrl, uploadImageToPublicURL}