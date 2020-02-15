require('es6-promise').polyfill();
require('isomorphic-fetch');

const querystring = require('querystring');

const generateHeaders = additionalHeaders => {
  const headers = new Headers();
  headers.append('Accept', 'application/json;charset=UTF-8');
  headers.append('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
  Object.keys(additionalHeaders).forEach(key => {
    headers.append(key, additionalHeaders[key]);
  });
  return headers;
};

const errs = {
  timeout: {
    success: false,
    code: 0,
    msg: 'Request Timeout: 20 seconds'
  },
  neterr: {
    success: false,
    code: 1,
    msg: 'Network Error'
  },
  bussiness: {
    success: false,
    code: 2,
    msg: 'System Error'
  }
};

module.exports = {
  post: (url, data, headers = {}) => {
    const config = {
      headers: generateHeaders(headers),
      method: 'POST',
      credentials: 'include',
      timeout: 20000,
      body: querystring.stringify(data)
    };
    const request = fetch(url, config);

    return new Promise((resolve, reject) => {
      const fail = () => {
        reject(errs.timeout);
      };
      let to = setTimeout(fail, config.timeout);
      return fetch
        .then(response => {
          if (to) clearTimeout(to);
          if (response.status >= 400) {
            let e = errs.bussiness;
            e.msg = `Received error code ${response.status}`;
            reject(e);
            return;
          }
          return response.json().then(json => {
            if (json instanceof Object && json.output) {
              resolve(json);
            } else {
              let otherError = errs.bussiness;
              otherError.msg = json;
              reject(otherError);
            }
          });
        })
        .catch(() => {
          if (to) clearTimeout(to);
          reject(errs.neterr);
        });
    });
  }
};
