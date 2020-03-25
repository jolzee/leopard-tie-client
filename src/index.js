import http from './utils/http';
import prune from './utils/prune';
import TeneoResponse from './utils/teneo-response';
import { isNode } from 'browser-or-node';

const readClientOrigin = () => {
  if (typeof document === 'undefined' || !document.location) return;
  return document.location.origin;
};

const getHeaders = (currentSessionId, inputData) => {
  const headers =
    currentSessionId && isNode
      ? {
          Cookie: `JSESSIONID=${currentSessionId}`
        }
      : {};
  return 'headers' in inputData ? Object.assign(inputData.headers, headers) : headers;
};
const getParameters = prune(['viewtype', 'userinput', 'text', 'clientOrigin', 'headers']);
const formatEngineUrl = url => (url.endsWith('/') ? url : `${url}/`);
const appendSessionId = (url, sessionId) => (sessionId ? `${url};jsessionid=${sessionId}` : url);

const requestBody = body => {
  const clientOrigin = readClientOrigin();
  const jspViewNames = { viewtype: 'tieapi' };
  const parameters = clientOrigin ? Object.assign(jspViewNames, { clientOrigin }) : jspViewNames;
  return Object.assign(parameters, body);
};

function close(teneoEngineUrl, sessionId) {
  const endSessionUrl = appendSessionId(`${formatEngineUrl(teneoEngineUrl)}endsession`, sessionId);
  const headers = sessionId && isNode ? { Cookie: `JSESSIONID=${sessionId}` } : {};
  return http.post(endSessionUrl, requestBody(), headers); // returns a promise
}

const verifyInputData = inputData => {
  const validDataType = x => ['string', 'number', 'bool', 'object'].includes(typeof x);
  const keys = Object.keys(inputData);

  if (!(typeof inputData === 'object' && keys.includes('text'))) {
    throw new TypeError(
      `sendInput input data must be an object with atleast a 'text' property: ${JSON.stringify(inputData)}`
    );
  }

  if (!keys.every(key => validDataType(inputData[key]))) {
    throw new TypeError(
      `sendInput input data object can only contain values of type string, number or bool ${JSON.stringify(inputData)}`
    );
  }
};

function sendInput(teneoEngineUrl, currentSessionId, inputData, cb) {
  verifyInputData(inputData);
  const headers = getHeaders(currentSessionId, inputData);
  const parameters = getParameters(inputData);
  const body = requestBody(Object.assign({ userinput: inputData.text }, parameters));
  const url = appendSessionId(formatEngineUrl(teneoEngineUrl), currentSessionId);
  return http.post(url, body, headers); // returns a promise
}

function wrap(teneoResp) {
  return new TeneoResponse(teneoResp);
}

export default {
  wrap,
  close,
  sendInput,
  init: teneoEngineUrl => ({
    close: close.bind(null, teneoEngineUrl),
    sendInput: sendInput.bind(null, teneoEngineUrl),
    wrap
  })
};
