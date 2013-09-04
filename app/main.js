define([
	'backbone',
	'paster'
], function(Backbone, Paster){

	var Router = Backbone.Router.extend({
		routes: {
			'': 'paster',
			'p/:id': 'paster'
		},

		paster: function(id) {
			app.log('Fire up paster');
			new Paster({id: id});
		},

		redirect: function(id) {
			app.log('Redirect to old app');
			window.location.replace(app.config.baseurl + location.pathname);
		}
	});

	var concat = function(arr1, arr2) {
		var arr3 = [];
		for (var i = 0; i < arr1.length; i++) { arr3.push(arr1[i]); }
		for (var i = 0; i < arr2.length; i++) { arr3.push(arr2[i]); }
		return arr3;
	};

	var log_level = 3,
		log_levels = {
			'error': 1,
			'warn': 2,
			'debug': 3
		};

	var App = {
		initialize: function(){
			// Start router
			this.router = new Router();
			Backbone.history.start({
				pushState: true
			});

			this.router.on('navigate', function(url) {
				app.log('Navigate fired', url);
			});
		},
		log: function() {
			if (log_level == 0) return;

			var msg_level = (arguments.length > 1 && (arguments[0] in log_levels)) ? _.first(arguments) : 'debug';
			var args = concat(['[' + msg_level + ']'], arguments);

			if (!(log_levels[msg_level] > 0 && log_levels[msg_level] <= log_level)) return;

			if (window.console && 'log' in window.console) {
				if (typeof window.console.log.apply == 'function') {
					window.console.log.apply(window.console, args);
				} else {
					var log = Function.prototype.bind.call(console.log, console);
					log.apply(console, args);
				}
			}
		}
	};

	return App;
});