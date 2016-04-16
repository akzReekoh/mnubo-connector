'use strict';

var platform = require('./platform'),
    isArray = require('lodash.isarray'),
    isPlainObject = require('lodash.isplainobject'),
    async = require('async'),
    isEmpty = require('lodash.isempty'),
    authorizedDevices = {},
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

platform.on('adddevice', function (device) {
    if (!isEmpty(device) && !isEmpty(device._id)) {
        authorizedDevices[device._id] = device;
        platform.log(`Successfully added ${device._id} to the pool of authorized devices.`);
    }
    else
        platform.handleException(new Error(`Device data invalid. Device not added. ${device}`));
});

platform.on('removedevice', function (device) {
    if (!isEmpty(device) && !isEmpty(device._id)) {
        delete authorizedDevices[device._id];

        mnuboClient.objects
            .delete(device._id)
            .then(function() {
                platform.log(`Successfully removed ${device._id} from the pool of authorized devices.`);
            });
    }
    else
        platform.handleException(new Error(`Device data invalid. Device not removed. ${device}`));
});

platform.once('close', function () {
    platform.notifyClose();
});

let createObject = (device) => {
    mnuboClient.objects
        .create({
            x_device_id: device._id,
            x_object_type: device.object_type
        })
        .then(function(object) {
            platform.log(JSON.stringify({
                title: 'Object added to Mnubo.',
                data: object.x_device_id
            }));
        });
};

platform.once('ready', function (options, registeredDevices) {
    let keyBy = require('lodash.keyby');
	var mnubo = require('mnubo-sdk');

    mnuboClient = new mnubo.Client({
        id: options.client_id,
        secret: options.client_secret,
        env: options.env
    });

    if (!isEmpty(registeredDevices))
        authorizedDevices = keyBy(registeredDevices, '_id');

    async.each(registeredDevices, function(datum){
        createObject(datum);
    });

	platform.notifyReady();
	platform.log('Mnubo Connector has been initialized.');
});