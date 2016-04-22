'use strict';

const CLIENT_ID = 'tPlQIrCvgWQbKtVlwudDhVfHlVecScb4Yp3XxkHglkKoa4iW4W',
	CLIENT_SECRET = 'dLvvx7rRqfQCBeyhbaWJtAeGu94kwCnjsDedcQB7aM230JvKFW',
	ENV = 'sandbox';

var cp     = require('child_process'),
	should = require('should'),
	connector;

describe('Connector', function () {
	this.slow(5000);

	after('terminate child process', function (done) {
		this.timeout(7000);
		setTimeout(function(){
			connector.kill('SIGKILL');
			done();
		}, 5000);
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			should.ok(connector = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			connector.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			connector.send({
				type: 'ready',
				data: {
					options: {
						client_id : CLIENT_ID,
						client_secret: CLIENT_SECRET,
						env : ENV
					},
					devices: [
                        {
						    _id: 'Reekoh12345',
                            object_type: 'drink'
					    }
                    ]
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});

	describe('#data', function (done) {
		it('should process the JSON data', function () {
			connector.send({
				type: 'data',
				data: {
					device_id : 'Reekoh12345',
					event_type: 'drink'
				}
			}, done);
		});
	});
});