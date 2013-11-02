
export class Plugin {

	bot:any;

	constructor(bot:any) {
		this.bot = bot;
	}

	public reply(from, to, reply, type = 'privmsg') {
		var client = this.bot.client;

		switch (type) {
			case 'privmsg':
				if (to.charAt(0) == '#') {
					client.say(to, from + ': ' + reply);
				} else {
					client.say(from, reply);
				}
				break;

			case 'notice':
				client.notice(from, reply);
				break;
		}
	}

	public privmsg(to:string, message:string) {
		this.bot.client.say(to, message);
	}

	public notice(to:string, message:string) {
		
	}

    public isController(user:any):boolean {
        return user.account !== undefined && user.account in this.bot.network.controllers;
    }

    public hasAccess(from:any, to:string, modes:any, cb:any, notice:boolean = true) {
        var channelModes = ['', '+', '%', '@', '&', '~'];
        var isChannel = to.charAt(0) == '#';

        var controllerOverride = true;
        var channelMode = '';
        var allowQuery = true;

        var hasPermission = false;

        if ('object' === typeof modes) {
            if (modes.hasOwnProperty('controller'))
                controllerOverride = modes['controller'];

            if (modes.hasOwnProperty('channel'))
                channelMode = modes['channel'];

            if (modes.hasOwnProperty('query'))
                allowQuery = modes['query'];
        } else {
            channelMode = modes;
        }

        if (isChannel) {
            if (!this.bot.client.chans.hasOwnProperty(to)) {
                hasPermission = false;
            } else {
                hasPermission = channelModes.indexOf(this.bot.client.chans[to].users[from.nick]) >= channelModes.indexOf(channelMode);
            }
        } else {
            hasPermission = allowQuery;
        }
        if (!hasPermission && controllerOverride) {
            var isAdmin = false;

            if(from.account !== undefined) {
                if(from.account in this.bot.network.controllers) {
                    isAdmin = true;
                }
            }

            hasPermission = isAdmin;
        }

        cb(hasPermission);
        if (notice && !hasPermission) {
            this.reply(from, to, 'You are not authorized to do that.', 'notice');
        }
    }


}
