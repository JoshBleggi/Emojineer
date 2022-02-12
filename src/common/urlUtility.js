function tryParseUrl(text) {
    try {
      //Constructor will throw an exception if text is not in the valid form
      new URL(text);
    }
    catch (ex) {
      return false;
    }
    return true;
}

  module.exports = { tryParseUrl }