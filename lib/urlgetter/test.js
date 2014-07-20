var getter = new module.exports(['http://api-mrkev.rhcloud.com/redapi/roster',
							'http://api-mrkev.rhcloud.com/redapi/roster',
							'http://api-mrkev.rhcloud.com/redapi/roster',
							'http://api-mrkev.rhcloud.com/redapi/roster',
							'http://api-mrkev.rhcloud.com/redapi/roster'], 
						   [JSON.parse]);

getter.get().then(console.dir, console.error, console.log);