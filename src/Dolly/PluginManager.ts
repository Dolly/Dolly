export class PluginManager {

	bot:any;

	commandRegex:RegExp = new RegExp("^onCommand", "i");
	eventRegex:RegExp = new RegExp("^on", "i");

	constructor(bot:any) {
		this.bot = bot;
	}

	public load(namespace:string) {
		var self = this;

		console.info('Loading Plugin: ' + namespace);

		var pluginConfig = this.loadConfiguration(namespace);
		var pluginFile = require('../plugins/' + namespace + '/' + pluginConfig.mainFile);
		self.bot.plugins[namespace] = new pluginFile[pluginConfig.mainFile](self.bot);

		var hooks = this.findHooks(self.bot.plugins[namespace]);
		var events = hooks['events'];
		var commands = hooks['commands'];

		events.forEach(function(event) {
			console.log('Events Loop: ' + event);

			var callback = self.bot.plugins[namespace][event];
			console.log(callback);

			self.bot.PluginManager.addPluginEvent(self.bot, namespace, event, callback);
		});

		commands.forEach(function(command) {
			console.log('Commands Loop: ' + command);

			var callback = self.bot.plugins[namespace][command];
			var event = command.replace('onCommand', '');

			self.bot.PluginManager.addPluginEvent(self.bot, namespace, 'command.' + event, callback);
		});
	}

	public unload(namespace:string) {
		var bot = this.bot;

		// Unregister our events
		var hooks = bot.plugins[namespace]['hooks'];
		for (var hook in hooks) {
			if (hooks[hook].hasOwnProperty('event')) {
				bot.client.removeListener(hooks[hook]['event'], hooks[hook]['callback']);

				bot.log.info("Unregistered " + hooks[hook]['event'] + " hook for " + namespace);
			}
		}
	}

	private addPluginEvent(bot, plugin, ev, f) {
		if (typeof bot.plugins[plugin]['hooks'] == 'undefined') {
			bot.plugins[plugin]['hooks'] = [];
		}

		// Calls a function with a given this value and arguments
		// provided as an array (or an array-like object). Also
		// sets 'this' to the plugin's class.
		var callback = (function () {
			return function () {
				f.apply(that, arguments);
			};
		})();

		bot.plugins[plugin]['hooks'].push({event: ev, callback: callback});

		// Add the event listener and make sure the callback knows about
		// the plugins class.
		var that = bot.plugins[plugin];
		return bot.events.addListener(ev, callback);
	}

	private loadConfiguration(namespace:string) {
		var configFile = require('../plugins/' + namespace + '/plugin.json');

		return {
			name: configFile.name,
			title: configFile.title,
			description: configFile.description,
			version: configFile.version,
			author: configFile.author,
			requires: configFile.requires,
			nodeRequires: configFile.nodeRequires,
			mainFile: configFile.mainFile || this.pluckName(namespace)
		};
	}

	private pluckName(namespace:string):string {
		var end = namespace.split('/')[1];

		return end.charAt(0).toUpperCase() + end.slice(1);
	}

	private explodeCommand(name:string):string {
		var exploded = name.replace('onCommand', '');
		var split = exploded.match(/[A-Z][a-z]+/g);

		return split.join(' ');
	}

	private findHooks(Plugin:Plugin):Object {
		var methods = this.getMethods(Plugin);
		var hooks = {commands:[],events:[]};

		methods.forEach((function(method) {
			var isCommand = this.commandRegex.test(method);
			var isEvent = this.eventRegex.test(method);

			if(isCommand) {
				hooks.commands.push(method);
				console.log('Registered Command: ' + method);
			} else if(isEvent && !isCommand) {
				hooks.events.push(method);
				console.log('Registered Event: ' + method);
			} else {
				console.log('Not matched: ' + method);
			}

		}).bind(this));

		return hooks;
	}

	private getMethods(obj) {
		var res = [];
		for(var m in obj) {
			if(typeof obj[m] == "function") {
				res.push(m)
			}
		}
		return res;
	}


}
