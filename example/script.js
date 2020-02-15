const TIE = require('leopard-tie-client');

const teneoEngineUrl = 'https://some.teneo/engine-instance';
const logResponse = response => {
  console.log(response.output);
  return response;
};

TIE.sendInput(teneoEngineUrl, null, { text: 'My name is Peter' })
  .then(logResponse)
  .then(({ sessionId }) => TIE.sendInput(teneoEngineUrl, sessionId, { text: 'What is my name?' }))
  .then(logResponse)
  .then(({ sessionId }) => TIE.close(teneoEngineUrl, sessionId));
