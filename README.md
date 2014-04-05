Aquastream XT application for Linux
=================================

## Introduction

This is a Node.js application for displaying Aquastream XT pump information, such as water temperature, flow, current frequency, etc.
It is built on top of [node-aquastreamxt-api](https://github.com/adick/node-aquastreamxt-api), which is a native Node.js addon I wrote for communicating with the hardware.

Currently it is *read-only*, so you can't change any settings yet. I still have some problems with writing data to the device but this is planned to be supported some day.

## Installation

This guide is for Debian based distros (Debian, Ubuntu. LMDE/Mint, ...) so you might have to adjust some of the commands if you are on a different box.

### Install g++ if not installed

    $ sudo apt-get install g++


### Install Node.js

    $ sudo add-apt-repository ppa:chris-lea/node.js
    $ sudo apt-get update
    $ sudo apt-get install python-software-properties python g++ make nodejs

(See [this manual](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager) if you have problems)


### Install module dependencies
`cd` to the directory where you downloaded the `node-aquastreamxt` sources and install it:

    $ npm install

This installs all required dependencies (including [node-aquastreamxt-api](https://github.com/adick/node-aquastreamxt-api)).


### Done!
Run the app with

    $ node app

and visit [http://localhost:8080](http://localhost:8080) - you should see the interface:

![screenshot](https://raw.githubusercontent.com/adick/node-aquastreamxt/master/screenshot.png)


## Troubleshooting

### Error: Couldn't find Aquastream XT!

* Make sure your current system user can access the USB device. On debian systems this can be done using an udev rule.
Create a new file `99-hiddev.rules` in `/lib/udev/rules.d/` with the following contents:

        SUBSYSTEMS=="usb", ATTRS{idVendor}=="0c70", ATTRS{idProduct}=="f0b6", MODE="0666"


* reload udev system, if this doesn't help maybe a reboot is required

        sudo udevadm control --reload-rules
        sudo udevadm trigger
