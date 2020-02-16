import superagent from 'superagent';

const generateHeaders = additionalHeaders => {
  return Object.assign(additionalHeaders, {
    Accept: 'application/json;charset=UTF-8',
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  });
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
          response: 7000, // Wait 7 seconds for the server to start sending,
          deadline: 20000 // but allow 20 seconds for the request to finish.
        })
        .set(generateHeaders(headers))
        .send(params)
        .then(
          res => {
            let json = res.body;
            if (json instanceof Object && 'status' in json) {
              resolve(json);
            } else {
              let businessError = errors.business;
              businessError.message = json;
              reject(businessError);
            }
          },
          err => {
            if (err.timeout) {
              reject(errors.timeout);
            } else {
              let e = errors.business;
              e.message = `Received error code ${res.status}`;
              reject(e);
            }
          }
        );
    });
  }
};
