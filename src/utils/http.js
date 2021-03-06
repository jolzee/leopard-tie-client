import superagent from 'superagent';
// import unescapeJs from 'unescape-js';

const generateHeaders = additionalHeaders => {
  return Object.assign(additionalHeaders, {
    Accept: 'application/json'
  });
};

const getCorrectType = val => {
  let temp = val.trim().toLowerCase();
  temp = temp === 'true' || (temp === 'false' ? false : val.trim()); //
  if (typeof temp === 'boolean') {
    return temp;
  }
  if (/^\d+$/.test(temp)) {
    // is number
    return parseInt(temp, 16);
  } else {
    return temp;
  }
};

const isJSON = str => {
  if (/^\s*$/.test(str)) return false;
  str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
  str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
  str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
  return /^[\],:{}\s]*$/.test(str);
};

const cleanOutputParams = responseObj => {
  for (let [key, value] of Object.entries(responseObj.output.parameters)) {
    if (isJSON(value)) {
      try {
        let parsedJsonResult = JSON.parse(value);
        responseObj.output.parameters[key.trim()] = parsedJsonResult;
      } catch (e) {
        delete responseObj.output.parameters[key];
      }
    } else {
      // not json - check for empty param and delete
      if (value && value.trim() !== '') {
        responseObj.output.parameters[key.trim()] = getCorrectType(value);
      } else {
        delete responseObj.output.parameters[key];
      }
    }

    if (key !== key.trim() && key in responseObj.output.parameters) {
      delete responseObj.output.parameters[key];
    }
  }
  return responseObj;
};

const success = {
  status: 1,
  message: 'logout'
};

const errors = {
  timeout: {
    success: false,
    status: 2,
    message: 'Request Timeout: '
  },
  net: {
    success: false,
    status: 3,
    message: 'Network Error'
  },
  business: {
    success: false,
    status: 4,
    message: 'System Error'
  }
};

export default {
  post: (url, params, headers = {}, timeoutSeconds) => {
    return new Promise((resolve, reject) => {
      superagent
        .post(url)
        .withCredentials()
        .type('form')
        .timeout({
          response: timeoutSeconds * 1000, // Wait timeoutSeconds seconds for the server to start sending,
          deadline: timeoutSeconds * 1000 // but allow timeoutSeconds seconds for the request to finish.
        })
        .set(generateHeaders(headers))
        .send(params)
        .then(
          res => {
            let json = res.body;
            if (json instanceof Object && 'status' in json) {
              resolve(cleanOutputParams(json));
              return;
            } else if (json === null) {
              resolve(success);
              return;
            } else {
              let businessError = errors.business;
              businessError.message = json;
              reject(businessError);
              return;
            }
          },
          err => {
            if (err.timeout) {
              let timeout = Object.assign({}, errors.timeout);
              timeout.message = timeout.message + timeoutSeconds + ' seconds';
              reject(timeout);
            } else if (url.includes('endsession') && err.message.includes('Access-Control-Allow-Origin')) {
              // This happens on teneo.ai for endsession CORS requests.. Assume session was killed
              resolve(success);
            } else {
              let e = errors.business;
              e.message = err;
              reject(e);
            }
          }
        );
    });
  }
};
