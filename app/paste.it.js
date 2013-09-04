require.config({
	paths: {
		jquery: '//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min',
		backbone: '../vendor/backbone/backbone-min',
		underscore: '../vendor/underscore/underscore-min',

		codemirror: '../vendor/CodeMirror/lib/codemirror',
		'cm.mode.xml': '../vendor/CodeMirror/mode/xml/xml',
		'cm.mode.css': '../vendor/CodeMirror/mode/css/css',
		'cm.mode.javascript': '../vendor/CodeMirror/mode/javascript/javascript',
		'cm.mode.html': '../vendor/CodeMirror/mode/htmlmixed/htmlmixed',
		'cm.addon.activeline': '../vendor/CodeMirror/addon/selection/active-line',
		'cm.addon.brackets': '../vendor/CodeMirror/addon/edit/matchbrackets',

		zeroclipboard: '../vendor/ZeroClipboard/ZeroClipboard.min',

		'beautify': '../vendor/js-beautify/js/lib/beautify',
		'beautify.html': '../vendor/js-beautify/js/lib/beautify-html',
		'beautify.css': '../vendor/js-beautify/js/lib/beautify-css',

		parse: '//www.parsecdn.com/js/parse-1.2.9.min',

		paster: 'views/paster'
	},

	shim: {
		'underscore': {
			exports: '_'
		},
		'jquery': {
			exports: '$'
		},
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'parse': {
			deps: ['underscore', 'jquery'],
			exports: 'Parse'
		},

		'cm.mode.xml': {
			deps: ['codemirror']
		},
		'cm.mode.css': {
			deps: ['codemirror']
		},
		'cm.mode.javascript': {
			deps: ['codemirror']
		},
		'cm.mode.html': {
			deps: ['codemirror']
		},
		'cm.addon.activeline': {
			deps: ['codemirror']
		},
		'cm.addon.brackets': {
			deps: ['codemirror']
		},

		'beautify.css': {
			deps: ['beautify']
		},
		'beautify.html': {
			deps: ['beautify']
		},

		'paster': {
			deps: [
				'cm.mode.xml',
				'cm.mode.css',
				'cm.mode.javascript',
				'cm.mode.html',
				'cm.addon.activeline',
				'cm.addon.brackets'
			]
		}
	}
});

/*
	<script src="//www.parsecdn.com/js/parse-1.2.9.min.js"></script>
	<script src="paste.it.js"></script>
	<script src="vendor/js-beautify/js/lib/beautify.js"></script>
	<script src="vendor/js-beautify/js/lib/beautify-css.js"></script>
	<script src="vendor/js-beautify/js/lib/beautify-html.js"></script>
	<script src="vendor/CodeMirror/lib/codemirror.js"></script>
	<script src="vendor/CodeMirror/mode/xml/xml.js"></script>
	<script src="vendor/CodeMirror/mode/css/css.js"></script>
	<script src="vendor/CodeMirror/mode/javascript/javascript.js"></script>
	<script src="vendor/CodeMirror/mode/htmlmixed/htmlmixed.js"></script>
	<script src="vendor/CodeMirror/addon/selection/active-line.js"></script>
	<script src="vendor/CodeMirror/addon/edit/matchbrackets.js"></script>
	<script src="vendor/ZeroClipboard/ZeroClipboard.min.js"></script>
*/

require(['main'], function(App) {
	// The "app" dependency is passed in as "App"
	window.app = App;
	App.initialize();
});