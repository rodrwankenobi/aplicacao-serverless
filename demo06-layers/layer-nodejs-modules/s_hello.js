
var serverlessSDK = require('./serverless_sdk/index.js');
serverlessSDK = new serverlessSDK({
  orgId: 'rodrwankenobi',
  applicationName: 'hello-sls',
  appUid: '6fw0BGZ73jtFNcQtL2',
  orgUid: '1c012019-6be8-44b5-9b62-a71b03ef446f',
  deploymentUid: 'dbf3c104-0cdc-4da2-b586-b2fa38f0b8d6',
  serviceName: 'layer-nodejs-modules',
  shouldLogMeta: false,
  shouldCompressLogs: true,
  disableAwsSpans: false,
  disableHttpSpans: false,
  stageName: 'dev',
  serverlessPlatformStage: 'prod',
  devModeEnabled: false,
  accessKey: null,
  pluginVersion: '5.4.3',
  disableFrameworksInstrumentation: false
});

const handlerWrapperArgs = { functionName: 'layer-nodejs-modules-dev-hello', timeout: 6 };

try {
  const userHandler = require('./s_hello.js');
  module.exports.handler = serverlessSDK.handler(userHandler.handler, handlerWrapperArgs);
} catch (error) {
  module.exports.handler = serverlessSDK.handler(() => { throw error }, handlerWrapperArgs);
}