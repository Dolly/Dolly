export class PluginManager {

	bot:any;

	constructor(bot:any) {
		this.bot = bot;
	}

	public load(namespace:string) {
		var self = this;

		console.info('Loading Plugin: ' + namespace);

		var pluginConfig = this.loadConfiguration(namespace);
		var pluginFile = require('../plugins/' + namespace + '/' + pluginConfig.mainFile);
		self.bot.plugins[namespace] = new pluginFile[pluginConfig.mainFile](self.bot);


		['registered', 'motd', 'names', 'topic', 'join', 'part', 'quit', 'kick', 'kill', 'message', 'notice', 'ping', 'pm', 'ctcp', 'ctcpNotice', 'ctcpPrivmsg', 'ctcpVersion', 'nick', 'plusMode', 'minusMode', 'whois', 'channelistStart', 'channelistItem', 'channelList', 'raw', 'error'].forEach(function (event) {
			var onEvent = 'on' + event.charAt(0).toUpperCase() + event.substr(1),
				callback = self.bot.plugins[namespace][onEvent];

			if (typeof callback == 'function') {
				self.bot.PluginManager.addPluginEvent(self.bot, namespace, event, callback);
			}
		});
	}

	private addPluginEvent(bot, plugin, ev, f) {
		if (typeof bot.plugins[plugin]['hooks'] == 'undefined') {
			bot.plugins[plugin]['hooks'] = [];
		}

		var callback = (function () {
			return function () {
				f.apply(that, arguments);
			};
		})();

		bot.plugins[plugin]['hooks'].push({event: ev, callback: callback});

		var that = bot.plugins[plugin];
		return bot.client.addListener(ev, callback);
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


}
