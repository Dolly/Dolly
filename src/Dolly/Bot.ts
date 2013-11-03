/// <reference path="../.ts/node.d.ts" />
/// <reference path="../.ts/js-yaml.d.ts" />
/// <reference path="../.ts/mongoose.d.ts" />
/// <reference path="../.ts/irc.d.ts" />
/// <reference path="../.ts/bunyan.d.ts" />
/// <reference path="../.ts/underscore.d.ts" />
/// <reference path="../.ts/sequelize.d.ts" />

import events = require('events');
import path = require('path');
import fs = require('fs');
import irc = require('irc');
import PluginManager = require('PluginManager');
import _ = require('underscore');
import util = require('util');
import os = require('os');
import repl = require("repl");
import Sequelize = require("sequelize");

export class Bot {

    PluginManager:PluginManager.PluginManager;

    log:any;

    config:any;
    network: any;
    plugins:any;
    hooks:any;
    database:any;
    client:any;

    db:any;

    constructor() {
        // Load Our Stuff
        this.PluginManager = new PluginManager.PluginManager(this);

        this.config = require('../../config/config.json');
        this.network = {};
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
        var self = this;
        this.network = this.config.networks[0];

        this.setupShell();
        this.setupDatabase();

        this.client = new irc.Client(this.network.host, this.network.nick, this.network);

        if(self.config.plugins !== null || self.config.plugins !== []) {
            self.config.plugins.forEach(function (p) {
                this.PluginManager.load(p);
            }, this);
        }

        this.client.addListener('raw', function (raw) {
            util.log('RECV: ' + raw.rawCommand + ' ' + raw.args.join(' '));
        });

        // Command handler
        this.client.addListener('message', function(nick, to, text, message) {
            if(text[0] === '.') {

                var matches = [];

                // Check all loaded plugins
                for(var key in self.plugins) {

                    // And all of their registered commands
                    for(var command in self.plugins[key].commands) {
                        var commandName = '.' + command;

                        if (text.substring(0, commandName.length) == commandName) {
                            matches.push(commandName);
                        }
                    }
                }

                var longest = matches.sort(function (a, b) { return b.length - a.length; })[0];
                self.client.whois(nick, function(whois) {
                    self.client.emit('command' + longest, whois, to, text, message);
                });
            }
        });

        /**
         * Sends errors to plugins and if debug show them
         */
        this.client.addListener('error', function (message) {
            //console.warn(message);
        });

    }

    private setupDatabase() {
        var dbConfig = this.config.database;

        this.db = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password);
    }

}
