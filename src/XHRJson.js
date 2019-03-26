/**
 * @fileOverview XHRJson able to make XHR Request and return an Object from
 * JSON file.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a xhrJSON. */
window.xhrJSON = class xhrJSON { // eslint-disable-line
  /**
   * Can a path and return with a CB an Object from the JSON file.
   *
   * @param {String} path   - The ABS path to the JSON File.
   * @param {Func} callback - A callback function.
   */
  static loadJSON (key, path, callback) {
    var xobj = new window.XMLHttpRequest()
    xobj.overrideMimeType('application/json')
    xobj.open('GET', path, true)
    xobj.onreadystatechange = function () {
      if (xobj.readyState === 4 && xobj.status === 200) {
        callback(key, xobj.responseText)
      }
    }

    xobj.send(null)
  }
}
