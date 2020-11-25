export default class TeneoResponse {
  constructor(json) {
    let type = typeof json;
    if (!(type === 'function' || (type === 'object' && !!json))) {
      console.error('ERROR: TeneoResponse: Not an Object', json);
      throw new Error("Teneo Response constructed with something that isn't an object");
    }

    if (!('output' in json)) {
      console.error('ERROR: TeneoResponse: Obj incorrect', json);
      throw new Error("Teneo Response constructed with an Object without an 'output' property");
    }
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

  getParameterNames() {
    let paramNames = [];
    for (let [key] of Object.entries(this.json.output.parameters)) {
      paramNames.push(key);
    }
  }

  hasParametersStartingWith(prefix) {
    let result = false;
    for (let [key, value] of Object.entries(this.json.output.parameters)) {
      if (key.startsWith(prefix)) {
        result = true;
      }
    }
    return result;
  }

  hasParametersContaining(strMatch) {
    let result = false;
    for (let [key, value] of Object.entries(this.json.output.parameters)) {
      if (key.indexOf(strMatch) > -1) {
        result = true;
      }
    }
    return result;
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
