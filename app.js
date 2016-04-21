'use strict';

var platform = require('./platform'),
    isArray = require('lodash.isarray'),
    isPlainObject = require('lodash.isplainobject'),
    async = require('async'),
    isEmpty = require('lodash.isempty'),
	mnuboClient;

let sendData = function(data, callback){
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

            callback();
        })
        .catch(function(error){
            callback(error);
        });
};

let createObject = (device, callback) => {
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
        })
        .catch(function(error){
            callback(error);
        });
};

platform.on('data', function (data) {
    if(isPlainObject(data)){
        sendData(data, (error) => {
            if(error) {
                console.error(error);
                platform.handleException(error);
            }
        });
    }
    else if(isArray(data)){
        async.each(data, (datum, done) => {
            sendData(datum, done);
        }, (error) => {
            if(error) {
                console.error(error);
                platform.handleException(error);
            }
        });
    }
    else
        platform.handleException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${data}`));
});

platform.on('adddevice', function (device) {
    createObject(device, (error) => {
        if(error) {
            console.error(error);
            platform.handleException(error);
        }
    });
});

platform.on('removedevice', function (device) {
    mnuboClient.objects
        .delete(device._id)
        .then(function() {
            platform.log(`Successfully removed ${device._id} from the pool of authorized devices.`);
        })
        .catch(function(error){
            console.error(error);
            platform.handleException(error);
        });
});

platform.once('close', function () {
    platform.notifyClose();
});

platform.once('ready', function (options, registeredDevices) {
	var mnubo = require('mnubo-sdk');

    mnuboClient = new mnubo.Client({
        id: options.client_id,
        secret: options.client_secret,
        env: options.env
    });

    async.each(registeredDevices, function(datum, done){
        createObject(datum, done);
    }, (error) => {
        if(error) {
            console.error(error);
            platform.handleException(error);
        }
    });

	platform.notifyReady();
	platform.log('Mnubo Connector has been initialized.');
});