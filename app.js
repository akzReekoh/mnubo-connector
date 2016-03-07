'use strict';

var platform = require('./platform'),
    isArray = require('lodash.isarray'),
    isPlainObject = require('lodash.isplainobject'),
    async = require('async'),
    isEmpty = require('lodash.isempty'),
	mnuboClient;

let sendData = function(data){
    if(isEmpty(data.device_id))
        data.device_id = data.rkh_device_info.id;

    mnuboClient.events
        .send([{
            'x_object': {
                'x_device_id': data.device_id
            },
            'x_event_type': data.event_type
        }])
        .then(function(data) {
            platform.log(JSON.stringify({
                title: 'Data sent to Mnubo.',
                data: data
            }));
        })
        .catch(function(error){
            platform.handleException(error);
        });
};

platform.on('data', function (data) {
    if(isPlainObject(data)){
        sendData(data);
    }
    else if(isArray(data)){
        async.each(data, function(datum){
            sendData(datum);
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