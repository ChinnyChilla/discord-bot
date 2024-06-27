// require('dotenv').config()
const pino = require('pino');
const path = require('path');
const pretty = require('pino-pretty')
const fs = require('fs')

var gulidLoggers = new Map();

var streams = [
	{ level: 'debug', stream: fs.createWriteStream(path.join(__dirname, "../logs/system-debug.log")) },
	{ level: 'warn', stream: fs.createWriteStream(path.join(__dirname, "../logs/system-warnings.log")) },
	{ level: 'error', stream: pretty() },
]

const systemLogger = pino({
	level: 'trace',
	customLevels: {
		status: 81,
	},
}, pino.multistream(streams));

async function getGuildLogger(guildID) {
	if (!gulidLoggers.get(guildID)) {
		systemLog("info", `guildLogger not found for ${guildID}, creating one`)
		var streams = [
			{level: 'trace', stream: fs.createWriteStream(path.join(__dirname, `../logs/${guildID}-trace.log`))},
			{level: 'info', stream: fs.createWriteStream(path.join(__dirname, `../logs/${guildID}-info.log`))},
			{level: 'error', stream: fs.createWriteStream(path.join(__dirname, `../logs/${guildID}-errors.log`))},
			{level: 'fatal', stream: pretty()},
		]
		const guildLogger = pino({
			level: 'trace'
		}, pino.multistream(streams));
		gulidLoggers.set(guildID, guildLogger);
		systemLog("debug", `Created a guildLogger for ${guildID}`)
	};
	return gulidLoggers.get(guildID);
}

async function guildLog(guildID, level, content) {
	const guildLogger = await getGuildLogger(guildID);
	log(guildLogger, level, content);
	return;

}

async function systemLog(level, content) {
	log(systemLogger, level, content);
	return;
}

function log(logger, level, content) {
	switch (level.toUpperCase()) {
		case "TRACE":
			logger.trace(content);
			break;
		case "DEBUG":
			logger.debug(content);
			break;
		case "INFO":
			logger.info(content);
			break;
		case "WARN":
			logger.warn(content);
			break;
		case "ERROR":
			logger.trace(content[0]);
			logger.error(content[1]);
			break;
		case "FATAL":
			logger.fatal(content[0], content[1]);
			break;
		case "STATUS":
			logger.status(content);
			break;
		default:
			logger.trace(content);
	}
}


module.exports = { guildLog, systemLog }

