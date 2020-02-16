import 'es6-promise/auto';
import 'isomorphic-fetch';
import querystring from 'querystring';

const generateHeaders = additionalHeaders => {
  const headers = new Headers();
  headers.append('Accept', 'application/json;charset=UTF-8');
  headers.append('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
  Object.keys(additionalHeaders).forEach(key => {
    headers.append(key, additionalHeaders[key]);
  });
  return headers;
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
        reject(errors.timeout);
      };
      let to = setTimeout(fail, config.timeout);
      return request
        .then(response => {
          if (to) clearTimeout(to);
          if (response.status >= 400) {
            let e = errors.business;
            e.message = `Received error code ${response.status}`;
            reject(e);
            return;
          }
          response.json().then(json => {
            if (json instanceof Object && 'status' in json) {
              resolve(json);
            } else {
              let businessError = errors.business;
              businessError.message = json;
              reject(businessError);
            }
          });
        })
        .catch(() => {
          if (to) clearTimeout(to);
          reject(errors.net);
        });
    });
  }
};
