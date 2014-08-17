JqUi = {
	/**
	 * [popupMessage description]
	 * @param  {[type]} title   [description]
	 * @param  {[type]} message [description]
	 * @return {[type]}         [description]
	 */
	popupMessage: function(title, message) {
		$('<div title="' + title + '"><p>' + message + '</p></div>')
			.dialog({
				modal: true,
				buttons: {
					"Ok": function() {
				  		$(this).dialog("close");
					}
				}
			});
	},

	/**
	 * [popupWithButtons description]
	 * @param  {[type]} title   [description]
	 * @param  {[type]} message [description]
	 * @param  {Object} buttons {"name": function(){}}.
	 * @return {[type]}         [description]
	 */
	popupWithButtons: function(title, message, buttons) {
		var _buttons = {};

		// return wrapped function
		var createWarpFun = function(func) {
			return function() {
				func();
				$(this).dialog("close");
			};
		}

		// copy and wrap functions
		for (var key in buttons) {
			if (!buttons.hasOwnProperty(key)) {
				continue;
			}

			_buttons[key] = createWarpFun(buttons[key]);
		}

		// popup
		$('<div title="' + title + '"><p>' + message + '</p></div>')
			.dialog({
				"modal": true,
				"buttons": _buttons,
			});
	},
};