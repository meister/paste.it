define([
	'backbone',
	'parse',
	'models/paste',
	'beautify',
	'beautify.css',
	'zeroclipboard'
], function(Backbone, Parse, PasteModel, js_beautify, css_beautify, ZeroClipboard) {

	return Backbone.View.extend({
		el: '#paster',
		template: $('#t-start-hint').text(),

		initialize: function(opts) {
			Parse.initialize("otFOtsnNzgIdS4T8pfaDqqAyF2L6261awiowr5Lo", "4GwONhWYVxnhjVYk7Cu26stLhCmQHyEa5u6CJgmw");

			this.render();
			if (opts.id) {
				this.loadPaste(opts.id);
			} else {
				this.showHint();
			}
		},

		render: function() {
			this.$url = $('#url');

			this.editor = CodeMirror.fromTextArea(this.el, {
				lineNumbers: true,
				styleActiveLine: true,
				mode: 'javascript',
				theme: 'pasteit'
			});

			this.load();
		},

		load: function() {
			// Auto-save editor
			this.editor.on('change', _.bind(function() {
				this.removeTip();
				if (this.noSave) return;
				this.savePaste();

				if (this.editor.getValue().length) {
					$('#settings .clear:hidden').fadeIn();
				} else {
					$('#settings .clear:visible').fadeOut();
				}
			}, this));

			// Copy-paste monitor
			$(window).on('keydown.pasteit', _.bind(function(ev) {
				if (ev.keyCode == 86 && (ev.ctrlKey || ev.metaKey)) {
					this.editor.focus();
					this.removeTip();

					var newPaste = $.trim(this.editor.getValue()).length == 0;

					var originalSource = false;
					if (ev.shiftKey) {
						originalSource = true;
					}

					if (newPaste) {
						this.noSave = true;
					}

					setTimeout(_.bind(function() {
						this.noSave = null;
						this.savePaste(newPaste);
						this.beautify(originalSource);
					}, this), 100);
				}
			}, this));

			// Change content type clicker
			$(document).on('click.pasteit', '#content_type li', _.bind(function(ev) {
				this.setUi(ev.target.className);
			}, this));

			// Change content type clicker
			$(document).on('click.pasteit', '#settings .clear', _.bind(function(ev) {
				ev.preventDefault();
				this.model = null;
				this.setUrl();
				this.setUi('js');
				this.editor.setValue('');
				this.editor.focus();
			}, this));

			// Copy to clipboard
			var clip = new ZeroClipboard( this.$url.find('span'), {
			  moviePath: '/vendor/ZeroClipboard/ZeroClipboard.swf'
			});

			clip.on('load', _.bind(function (client) {
				app.log('Flash movie loaded and ready.');

				clip.on('dataRequested', _.bind(function (client, args) {
					if (this.$url.hasClass('ready')) {
						client.setText(this.$url.find('span').text());
					} else {
						return false;
					}
				}, this));

				client.on('complete', function (client, args) {
					app.log('Copied text to clipboard: ' + args.text);
					if (args.text) {
						var $el = $('#copied_message')
						$el.fadeIn(function() {
							setTimeout(function() {
								$el.fadeOut();
							}, 1000);
						});
					}
				});
			}, this));

			clip.on('noFlash', function (client) {
				app.log('warn', 'Your browser has no Flash.');
			});

			clip.on('wrongFlash', function (client, args) {
				app.log('warn', 'Flash 10.0.0+ is required but you are running Flash ' + args.flashVersion.replace(/,/g, '.'));
			});
		},

		showHint: function() {
			this.$tip = $(_.template(this.template, {os: (navigator.platform.match(/mac/i) ? 'mac' : 'other')}));
			$('body').append(this.$tip);
			this.$tip.fadeIn();
		},

		setUi: function(mode) {
			app.log('Set mode', mode);
			var modes = {
				'html': 'htmlmixed',
				'css': 'css',
				'js': 'javascript'
			};

			if (mode in modes) {
				this.contentType = mode;
				this.editor.setOption('mode', modes[this.contentType]);
				$('#content_type').prop('class', this.contentType);
				if (this.model && this.model.get('type') != this.contentType) {
					this.model.push({type: this.contentType});
				}
			}
		},

		removeTip: function() {
			if (this.$tip && !this.$tip.hasClass('hidden')) {
				this.$tip.addClass('hidden').fadeOut().promise().done(function() {
					$(this).remove();
				});
			}
		},

		savePaste: function(forceNew) {
			if ($.trim(this.editor.getValue()).length == 0) return;

			if (forceNew) {
				this.model = new PasteModel();
				this.model.push({
					content: this.editor.getValue(),
					type: this.contentType
				}, _.bind(function(object) {
					app.log('Created object', object);
					this.model = object;
					this.setUrl();
				}, this));

			} else {
				if (!this.model) {
					this.model = new PasteModel();
				}

				if (this.model.get('content') == this.editor.getValue() &&
					this.model.get('type') == this.contentType) {
					return;
				}

				this.model.push({
					content: this.editor.getValue(),
					type: this.contentType
				}, _.bind(function(object) {
					app.log('Updated object', object.id, object);
					this.setUrl();
				}, this));
			}
		},

		loadPaste: function(id) {
			var query = new Parse.Query(PasteModel);
			query.get(id, {
				success: _.bind(function(object) {
					app.log('Loaded object', object.id, object);
					this.model = object;
					this.removeTip();

					this.$url.find('span').text(location.href);
					this.$url.addClass('ready');

					this.setUi(this.model.get('type'));
					this.editor.setValue(this.model.get('content'));
				}, this)
			});
		},

		beautify: (function() {
			var beautify_in_progress = false;
			var looks_like_html = function(source) {
				// <foo> - looks like html
				// <!--\nalert('foo!');\n--> - doesn't look like html

				var trimmed = source.replace(/^[ \t\n\r]+/, '');
				var comment_mark = '<' + '!-' + '-';
				return (trimmed && (trimmed.substring(0, 1) === '<' && trimmed.substring(0, 4) !== comment_mark));
			};

			var looks_like_css = function(source) {
				return source.match(/([#|\.|\w])([\w|:|\s|\.]*)\{(\s*[-a-z]+\s*\:[^;]+\s*\;\s*)*\}/gi);
			};

			return function(original_source) {
				if (beautify_in_progress) return;

				beautify_in_progress = true;

				var source = this.editor ? this.editor.getValue() : this.$el.val(),
					output,
					opts = {};

				if (looks_like_html(source)) {
					output = original_source; // ? source : html_beautify(source, opts);
					this.setUi('html');
				} else if (looks_like_css(source)) {
					output = original_source ? source : css_beautify(source, opts);
					this.setUi('css');
				} else {
					output = original_source ? source : js_beautify(source, opts);
					this.setUi('js');
				}
				if (this.editor) {
					this.editor.setValue(output);
				} else {
					this.$el.val(output);
				}

				beautify_in_progress = false;
			}
		})(),

		setUrl: function() {
			if (!this.model) {
				app.router.navigate('/', {trigger: false, replace: true});
				this.$url.find('span').text('Paste it!');
				this.$url.removeClass('ready');
			} else {
				app.router.navigate('/p/' + this.model.id, {trigger: false, replace: true});
				this.$url.find('span').text(location.href);
				this.$url.addClass('ready');
			}
		}

	});

});