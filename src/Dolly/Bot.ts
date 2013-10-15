/// <reference path="../.ts/node.d.ts" />
/// <reference path="../.ts/js-yaml.d.ts" />
/// <reference path="../.ts/mongoose.d.ts" />
/// <reference path="../.ts/irc.d.ts" />
/// <reference path="../.ts/bunyan.d.ts" />
/// <reference path="../.ts/underscore.d.ts" />

import events = require('events');
import path = require('path');
import fs = require('fs');
import irc = require('irc');
import PluginManager = require('PluginManager');
import _ = require('underscore');
import util = require('util');
import os = require('os');
import repl = require("repl");

export class Bot {

	PluginManager:PluginManager.PluginManager;

	events:events.EventEmitter;

	configDir:string;

	log:any;
	chatLog:any;

	config:any;
	plugins:any;
	hooks:any;
	database:any;
	client:any;

	constructor() {
		// Load Our Stuff
		this.PluginManager = new PluginManager.PluginManager(this);
		this.events = new events.EventEmitter();

		this.config = require('../../config/config.json');
		this.plugins = {};
	}

	private setupShell() {
		var self = this;

		process.title = 'Dolly Bot';

		/*
		repl.start({
			prompt: "js> ",
			useGlobal: true,
			eval: function evalInput(cmd, context, filename, callback) {

				var result = eval(cmd);

				callback(null, result);
			}
		});
		*/
	}

	public spawn() {
		var config = this.config;
		var network = this.config.networks[0];

		this.setupShell();

		this.client = new irc.Client(network.host, network.nick, network);

		this.extendEvents(this.client);

		if(config.plugins !== null || config.plugins !== []) {
			config.plugins.forEach(function (p) {
				this.PluginManager.load(p);
			}, this);
		}

		this.events.addListener('raw', function (raw) {
			process.stdout.write(Math.round(new Date().getTime() / 1000) + ' ' + raw.rawCommand + ' ' + raw.args.join(' ') + os.EOL);
		});

		/**
		 * Sends errors to plugins and if debug show them
		 */
		this.client.addListener('error', function (message) {
			//console.warn(message);
		});

	}

	private extendEvents(client:any) {

		_.extend(this.events, client);
		delete this.events['opt'];
		delete this.events['supported'];
		delete this.events['chans'];
		delete this.events['conn'];
		delete this.events['prefixForMode'];
		delete this.events['modeForPrefix'];
		delete this.events['_whoisData'];
	}

}

interface Channel {

}

interface User {

} 
