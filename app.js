'use strict';

var get           = require('lodash.get'),
	async         = require('async'),
	isArray       = require('lodash.isarray'),
	isError       = require('lodash.iserror'),
	platform      = require('./platform'),
	isPlainObject = require('lodash.isplainobject'),
	mnuboClient;

let sendData = function (data, callback) {
	Object.assign(data, {
		'x_object': {
			'x_device_id': data.device_id || get(data, 'rkh_device_info._id')
		},
		'x_event_type': data.event_type || 'data'
	});

	delete data.device_id;
	delete data.event_type;
	delete data.rkh_device_info;

	mnuboClient.events
		.send([data])
		.then(function (data) {
			platform.log(JSON.stringify({
				title: 'Data sent to Mnubo.',
				data: data
			}));

			callback();
		})
		.catch(callback);
};

platform.on('data', function (data) {
	if (isPlainObject(data)) {
		sendData(data, (error) => {
			if (error && isError(error)) {
				console.error(error);
				platform.handleException(error);
			}
			else if (error && !isError(error)) {
				console.error(error);
				platform.handleException(new Error(error.message));
			}
		});
	}
	else if (isArray(data)) {
		async.each(data, (datum, done) => {
			sendData(datum, done);
		}, (error) => {
			if (error && isError(error)) {
				console.error(error);
				platform.handleException(error);
			}
			else if (error && !isError(error)) {
				console.error(error);
				platform.handleException(new Error(error.message));
			}
		});
	}
	else
		platform.handleException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${data}`));
});

platform.once('close', function () {
	platform.notifyClose();
});

platform.once('ready', function (options) {
	var mnubo = require('mnubo-sdk');

	mnuboClient = new mnubo.Client({
		id: options.client_id,
		secret: options.client_secret,
		env: options.env
	});

	platform.notifyReady();
	platform.log('Mnubo Connector has been initialized.');
});