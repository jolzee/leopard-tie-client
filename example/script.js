// const TIE = require('leopard-tie-client');
const TIE = require('../src/index');

const teneoEngineUrl = 'https://teneo-demos-fusion.presales.artificial-solutions.com/leopard/';
const logResponse = response => {
  console.log(response);
  return response;
};

TIE.sendInput(teneoEngineUrl, null, { text: 'My name is Peter' })
  .then(logResponse)
  .then(({ sessionId }) => TIE.sendInput(teneoEngineUrl, sessionId, { text: 'What is my name?' }))
  .then(logResponse)
  .then(({ sessionId }) => TIE.close(teneoEngineUrl, sessionId))
  .catch(err => console.error(`Error:`, err));
