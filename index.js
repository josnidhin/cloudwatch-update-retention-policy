/**
 * @author Jose Nidhin
 */
'use strict';

const AWS_REGION = process.env.AWS_REGION || 'eu-west-1',
  RETENTION_PERIOD = process.env.RETENTION_PERIOD || 30;

let aws = require('aws-sdk'),
  bluebird = require('bluebird'),
  bunyan = require('bunyan'),
  cloudwatchlogs, logger;

aws.config.region = AWS_REGION;
aws.config.setPromisesDependency(bluebird);
aws.config.apiVersions = {
  cloudwatchlogs: '2014-03-28'
};

cloudwatchlogs = new aws.CloudWatchLogs();

logger = bunyan.createLogger({
  name: 'cloudwatch-update-retention-policy',
  level: process.env.LOG_LEVEL || 'trace',
  serializers: bunyan.stdSerializers
});

/**
 *
 */
async function findLogGroups () {
  let params = {
      limit: 50
    },
    result = [],
    logGroups = {};

  do {
    if (logGroups.nextToken) {
      params.nextToken = logGroups.nextToken;
    }
    logGroups = await cloudwatchlogs.describeLogGroups(params).promise();
    result = result.concat(logGroups.logGroups);
  } while (logGroups.nextToken);

  return result;
}

/**
 *
 */
function setRetentionPeriod (logGroupName, retentionInDays) {
  let params = {
    logGroupName,
    retentionInDays
  };

  return cloudwatchlogs.putRetentionPolicy(params).promise();
}

/**
 *
 */
async function start () {
  let logGroups;

  try {
    logGroups = await findLogGroups();
  } catch (err) {
    logger.fatal(err);
    process.exit(1);
  }

  logger.debug(logGroups, 'Log groups');

  logGroups.forEach((item) => {
    logger.info(`Processing ${item.logGroupName}`);
    setRetentionPeriod(item.logGroupName, RETENTION_PERIOD)
    .catch((err) => {
      logger.error(item.logGroupName);
      logger.error(err);
    });
  });
}

start();
