# Mnubo Connector
[![Build Status](https://travis-ci.org/Reekoh/mnubo-connector.svg)](https://travis-ci.org/Reekoh/mnubo-connector)
![Dependencies](https://img.shields.io/david/Reekoh/mnubo-connector.svg)
![Dependencies](https://img.shields.io/david/dev/Reekoh/mnubo-connector.svg)
![Built With](https://img.shields.io/badge/built%20with-gulp-red.svg)

Mnubo Connector Plugin Connector for the Reekoh IoT Platform. Connects a Reekoh Instance with Mnubo's IoT Analytics Engine to push and synchronize device data.

## Description
This plugin posts events to a certain object/device created in Mnubo.

## Configuration
To configure this plugin, a Mnubo account is needed to provide the following:

1. Client ID - The Mnubo Client ID to use.
2. Client Secret - The Mnubo Client Secret to use.
3. Environment - The Mnubo account environment to use.

These parameters are then injected to the plugin from the platform.

## Sample input data
```
{
    device_id: 'Reekoh112233', //device ID is optional
    event_type: 'drink'
}
```