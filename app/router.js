define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone){

	var Router = Backbone.Router.extend({
		routes: {
			'': 'paster',
			'p/:id': 'paster'
		},

		paster: function(id) {
			logger.log('Redirect to old app');
			window.location.replace(app.config.baseurl + location.pathname);
		}
	});

	var initialize = function(){
		// Start router
		var AppRouter = new Router();
		Backbone.history.start();

		console.log('woiwowo');
	}

	return {
		initialize: initialize
	};
});