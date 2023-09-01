# Smartthings Soundbar to MQTT

NodeJS service that integrates a Samsung Soundbar (accessible through Smartthings API)
with HomeAssistant via MQTT.

## Prerequisites

- the project was written and tested on Ubuntu, 
  however, due to it being deployed in docker should work basically anywhere
  (this documentation does not cover setup on osx or windows)
- installed `docker` and `docker-compose`
- installed `node` and `npm`
- an MQTT broker of your choice
- Smartthings API key
- Smartthings device id for your soundbar

## Usage

1. Set up your config by copying `local.example.cjs` and filling out with necessary data.
2. Execute `setup.sh` that will transpile the project and set up with docker-compose.
   The script will start the service in the background
3. Profit!

## Supported features

- Advanced audio toggles
    - Night mode
    - Voice amplifier
    - Bass boost