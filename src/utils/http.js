import superagent from 'superagent';
import unescapeJs from 'unescape-js';

const generateHeaders = additionalHeaders => {
  return Object.assign(additionalHeaders, {
    Accept: 'application/json'
  });
};

const cleanOutputParams = responseObj => {
  for (let [key, value] of Object.entries(responseObj.output.parameters)) {
    try {
      let parsedJsonResult = JSON.parse(unescapeJs(value));
      responseObj.output.parameters[key.trim()] = parsedJsonResult;
    } catch (e) {
      if (value && value.trim() !== '') {
        responseObj.output.parameters[key.trim()] = unescapeJs(value.trim());
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
    message: 'Request Timeout: 20 seconds'
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
  post: (url, params, headers = {}) => {
    return new Promise((resolve, reject) => {
      superagent
        .post(url)
        .withCredentials()
        .type('form')
        .timeout({
          response: 20000, // Wait 20 seconds for the server to start sending,
          deadline: 30000 // but allow 30 seconds for the request to finish.
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
              reject(errors.timeout);
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
