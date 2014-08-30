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
	 * [popupBookmarkData description]
	 * @param  {Object} configure      {bookmark: {url: "xxx", title: "xxx", description: "xxx"},
	 *                                 	window: {title: "ooo", commitBtnLabel: "ooo", cancelBtnLabel: "ooo"}
	 *                                 	} if not set will use default value.
	 * @param  {Function} commitCallback Parameter: Object: {url: "xxx", title: "xxx", description: "xxx"}, return true will close window.
	 */
	popupBookmarkData: function(configure, commitCallback) {
		if (!configure) configure = {};

		// init bookmark object
		var bookmarkObj = (configure["bookmark"]) ? configure["bookmark"] : {};
		if (!bookmarkObj["url"]) bookmarkObj["url"] = "";  // url
		if (!bookmarkObj["title"]) bookmarkObj["title"] = "";  // title
		if (!bookmarkObj["description"]) bookmarkObj["description"] = "";  // description

		// init window object
		var windowObj = (configure["window"]) ? configure["window"] : {};
		if (!windowObj["title"]) windowObj["title"] = "Bookmark Data";  // title
		if (!windowObj["commitBtnLabel"]) windowObj["commitBtnLabel"] = "Submit";  // commit button label
		if (!windowObj["cancelBtnLabel"]) windowObj["cancelBtnLabel"] = "Cancel";  // cancel button label

		// html
		var htmlBody = '<form class="form-horizontal" role="form">' +
							'<div class="form-group">' +
								'<label for="url" class="control-label">URL:</label>' +
								'<input type="url" name="url" id="url" placeholder="URL..." class="form-control">' +
							'</div>' +

							'<div class="form-group">' +
								'<label for="title" class="control-label">Title:</label>' +
								'<input type="text" name="title" id="title" placeholder="Title" class="form-control">' +
							'</div>' +

							'<div class="form-group">' +
								'<label for="description" class="control-label">Description:</label>' +
								'<textarea name="description" id="description" placeholder="Description" class="form-control" rows="3"></textarea>' +
							'</div>' +
						'</form>';

		// buttons function
		var buttons = {};
		buttons[windowObj["commitBtnLabel"]] = function() {
			var bookmarkParams = {
				"url": $("#url", this).val(),
				"title": $("#title", this).val(),
				"description": $("#description", this).val(),
			};

			// callback
			if (commitCallback(bookmarkParams)) {
				$(this).dialog("close");
			}
		};
		buttons[windowObj["cancelBtnLabel"]] = function() {
			$(this).dialog("close");
		};
	
		// popup
		$('<div title="' + windowObj["title"] + '">' + htmlBody + '</div>').dialog({
			"modal": true,
			"buttons": buttons,
		});
	},

	/**
	 * [popupWithButtons description]
	 * @param  {String} title   window title
	 * @param  {String} message message
	 * @param  {Object} buttons {"name": function():boolean}. function return true will close window.
	 */
	popupWithButtons: function(title, message, buttons) {
		var content = '<p>' + message + '</p>';
		this.popupRawHtmlWithButtons(title, content, buttons);
	},

	/**
	 * [popupRawHtmlWithButtons description]
	 * @param  {String} title   window title
	 * @param  {String} content raw html
	 * @param  {Object} buttons {"name": function():boolean}. function return true will close window.
	 */
	popupRawHtmlWithButtons: function(title, content, buttons) {
		var _buttons = {};

		// return wrapped function
		var createWarpFun = function(func) {
			return function() {
				if (func()) {
					$(this).dialog("close");
				}
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
		$('<div title="' + title + '">' + content + '</div>').dialog({
			"modal": true,
			"buttons": _buttons,
		});
	}
};