# leopard-tie-client

![Node](https://img.shields.io/node/v/leopard-tie-client.svg?style=flat-square)
[![NPM](https://img.shields.io/npm/v/leopard-tie-client.svg?style=flat-square)](https://www.npmjs.com/package/leopard-tie-client)
[![Travis](https://img.shields.io/travis/jolzee/leopard-tie-client/master.svg?style=flat-square)](https://travis-ci.org/jolzee/leopard-tie-client)
[![David](https://img.shields.io/david/jolzee/leopard-tie-client.svg?style=flat-square)](https://david-dm.org/jolzee/leopard-tie-client)
[![Coverage Status](https://img.shields.io/coveralls/jolzee/leopard-tie-client.svg?style=flat-square)](https://coveralls.io/github/jolzee/leopard-tie-client)
[![Gitmoji](https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square)](https://gitmoji.carloscuesta.me/)
[![NPM](https://img.shields.io/npm/dt/leopard-tie-client.svg?style=flat-square)](https://www.npmjs.com/package/leopard-tie-client)

> Extended TIE Client that accepts additional custom request headers

### Usage

```js
import TIE from 'leopard-tie-client';
```

### Installation

Install via [yarn](https://github.com/yarnpkg/yarn)

    yarn add leopard-tie-client

or npm

    npm install leopard-tie-client

### Examples

See the [runkit](https://runkit.com/jolzee/leopard-tie-client) example.

### Builds

If you don't use a package manager, you can [access `leopard-tie-client` via unpkg (CDN)](https://unpkg.com/leopard-tie-client/), download the source, or point your package manager to the url.

`leopard-tie-client` is compiled as a collection of [CommonJS](https://flaviocopes.com/commonjs/) modules & [ES2015 modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) for bundlers that support the `jsnext:main` or `module` field in package.json (Rollup, Webpack 2)

The `leopard-tie-client` package includes precompiled production and development [UMD](https://github.com/umdjs/umd) builds in the [`dist/umd` folder](https://unpkg.com/leopard-tie-client/dist/umd/). They can be used directly without a bundler and are thus compatible with many popular JavaScript module loaders and environments. You can drop a UMD build as a [`<script>` tag](https://unpkg.com/leopard-tie-client) on your page. The UMD builds make `leopard-tie-client` available as a `window.leopardTieClient` global variable.

## Usage

**Example usage**

```javascript
const TIE = require('leopard-tie-client');

const teneoEngineUrl = 'https://some.teneo/engine-instance';
const logResponse = response => {
  console.log(response);
  return response;
};

TIE.sendInput(teneoEngineUrl, null, { text: 'My name is Peter' })
  .then(logResponse)
  .then(({ sessionId }) => TIE.sendInput(teneoEngineUrl, sessionId, { text: 'What is my name?' }))
  .then(logResponse)
  .then(({ sessionId }) => TIE.close(teneoEngineUrl, sessionId))
  .catch(err => console.error(err));
```

Note that when used as a Node.js module, you need to manually handle the session by passing the session ID to the API functions.

**Example usage**

```javascript
const teneoEngineUrl = 'https://some.teneo/engine-instance';
const logResponse = response => {
  console.log(response);
  return response;
};

TIE.sendInput(teneoEngineUrl, null, { text: 'My name is Peter' })
  .then(logResponse)
  .then(({ sessionId }) => TIE.sendInput(teneoEngineUrl, null, { text: 'What is my name?' }))
  .then(logResponse)
  .then(({ sessionId }) => TIE.close(teneoEngineUrl))
  .catch(err => console.error(err));
```

Note that in the browser the session is maintained via cookies and the API cannot manually override the browser's handling of the session. That means that you never need (nor should) pass the session ID when using the API in the browser.

**A note on CORS**

TIE API Client needs to send a cookie to the Teneo Engine instance in order for the session to be maintained. This requires CORS communication to be setup between the place where the TIE API Client is and the Teneo Engine instance. The TIE API Client handles this by sending the value of `document.location.origin` to the Teneo Engine instance as a parameter.

By default the Teneo Engine includes CORS headers in the responses to browser requests coming from any domain. This means any site can interact with a Teneo Engine. If you want to restrict your engine to only include CORS headers for specific domains, you can add a file called `tieapi_cors_origins.txt` to your solution. You can upload this file in Teneo Studio in the Teneo Resource Manager where you should add it to the `views` folder. The file should contain the list of allowed origin domains (one domain per line, domains should include port numbers if applicable).

## API Documentation

### TIE.sendInput

Sends _inputData_ to the _url_. Returns a _Promise_ if no _callback_ is provided.

##### Signature

```javascript
TIE.sendInput((url: string), (sessionId: string), (inputData: object), [(callback: function)]);
```

##### Parameters

`url`: URL to a running Teneo Engine instance.

`sessionId`: Session id to be passed to the Teneo Engine instance. Pass _null_ if unknown. Also not required if TIE client is used in the browser. The browser will automatically set and return session cookies.

`inputData`: An object taking the shape:

```javascript
{
  text: "Some input text",
  channel: "webview",
  command: "login",
  someParam: "foo",
  anotherParam: "bar",
  headers: {
	  Authorization: "Basic blahblahblah==",
	  Date: "Tue, 15 Nov 1994 08:12:31 GMT",
	  otherHeaderName: "some header value"
  }
}
```

All properties except _text_ and _headers_ will be sent to the Teneo Engine instance as extra parameters.

The _headers_ property if not required. Although if your TIE resides behind a reverse proxy and you need to pass request headers for say authorization then you have a means of setting any custom headers.

`callback(error: Error, response: teneoEngineResponse)` [Optional]: Callback for handling the response from the Teneo Engine instance.

### TIE.close

Closes the running (or specified session). Returns a _Promise_ if no _callback_ is provided.

##### Signture

```javascript
TIE.close((url: string), (sessionId: string), [(callback: function)]);
```

##### Parameters

`url`: URL to a running Teneo Engine instance.

`sessionId`: Session id to be passed to the Teneo Engine instance. Pass _null_ if unknown.

`callback(error: Error, response: TeneoEngineResponse)` [Optional]: Callback for handling the response from the Teneo Engine instance.

### TIE.init

Returns a version of the Teneo Interaction Engine API with the Teneo Engine url prefilled.

```javascript
> const teneoApi = TIE.init('https://some.teneo/engine-instance');
> teneoApi.sendInput(null, { text: 'Sending some text to the prefilled url' })
    .then(response =>
      console.log(response);
      return teneoApi.close(response.sessionId);
    }).catch(error => console.error(error));
```

##### Signature

```javascript
TIE.init((url: string));
```

##### Parameters

`url`: URL to a running Teneo Engine instance.

### TeneoEngineResponse

Response from the Teneo Interaction Engine API.

Normal response:

```json
{
  "status": 0,
  "input": {
    "text": "input text",
    "parameters": {}
  },
  "output": {
    "text": "output text",
    "emotion": "",
    "link": "",
    "parameters": {}
  },
  "sessionId": "current session id"
}
```

Error response:

```json
{
  "status": -1,
  "input": {
    "text": "input text",
    "parameters": {}
  },
  "message": "ERROR MESSAGE"
}
```

### Misc

This module was created using [generator-jolzee-node-module](https://github.com/jolzee/generator-jolzee-node-module).

This module provides a way of communicating with a Teneo Engine instance either on the server as a NodeJS module or in a browser loaded through a script node.

### License

The code is available under the [MIT](LICENSE) license.

### Contributing

We are open to contributions, see [CONTRIBUTING.md](CONTRIBUTING.md) for more info.
