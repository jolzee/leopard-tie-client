export default class TeneoResponse {
  constructor(json) {
    this.json = json;
  }

  getJson() {
    return this.json;
  }

  getSessionId() {
    return this.json.getSessionId;
  }

  getOutputText() {
    return this.json.output.text;
  }

  getInputText() {
    return this.json.input.text;
  }

  getEmotion() {
    return this.json.output.emotion;
  }

  hasEmotion() {
    return this.json.output.emotion || false;
  }

  getLink() {
    return this.json.output.link;
  }

  hasLink() {
    return this.json.output.link || false;
  }

  hasParameter(name) {
    return name in this.json.output.parameters;
  }

  getParameter(name) {
    return this.json.output.parameters[name];
  }

  getParametersStartingWith(prefix) {
    let result = {};
    for (let [key, value] of Object.entries(this.json.output.parameters)) {
      if (key.startsWith(prefix)) {
        result[key] = value;
      }
    }
    return result;
  }

  isObject(obj) {
    let type = typeof obj;
    return type === 'function' || (type === 'object' && !!obj);
  }
}
