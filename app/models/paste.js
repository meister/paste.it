define(['parse'], function(Parse) {

	var PasteModel = Parse.Object.extend('PasteObject', {

		saving: false,
		queue: false,
		timeout: false,
		timeoutDuration: 1200,

		push: function(data, next) {
			if (this.saving) {
				this.queue = data;
			}

			if (this.timeout) {
				this.timeout = null;
			}

			this.timeout = setTimeout(_.bind(function() {
				this.saving = true;
				this.save(data, {
					success: function(o) {
						this.timeout = null;
						this.saving = null;

						if (this.queue) {
							this.push(this.queue, next);
							this.queue = null;
						}

						if (next) {
							next(o);
						}
					}
				})
			}, this), (this.id ? this.timeoutDuration : 0));
		}

	});

	return PasteModel;

});