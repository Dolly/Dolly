
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

}
