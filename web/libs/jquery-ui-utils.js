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
	 * [popupFolderData description]
	 * @param  {[type]} configure      {folder: {name: "xxx"},
	 *                                 	window: {title: "ooo", commitBtnLabel: "ooo", cancelBtnLabel: "ooo"}
	 *                                 	} if not set will use default value.
	 * @param  {Function} commitCallback Parameter: Object: {name: xxx}
	 */
	popupFolderData: function(configure, commitCallback) {
		configure = configure || {};

		// init folser
		var folderObj = configure["folder"] || {};
		if (!folderObj["name"]) folderObj["name"] = "";

		// init window
		var windowObj = configure["window"] || {};
		if (!windowObj["title"]) windowObj["title"] = "Bookmark Data";  // title
		if (!windowObj["commitBtnLabel"]) windowObj["commitBtnLabel"] = "Submit";  // commit button label
		if (!windowObj["cancelBtnLabel"]) windowObj["cancelBtnLabel"] = "Cancel";  // cancel button label

		// html
		var htmlBody = '<form class="form-horizontal" role="form">' +
							
							'<div class="form-group">' +
								'<label for="name" class="control-label">Name:</label>' +
								'<input type="text" title="name" id="name" placeholder="Name" class="form-control" value="' + folderObj["name"] + '">' +
							'</div>' +

						'</form>';

		// buttons function
		var buttons = {};
		buttons[windowObj["commitBtnLabel"]] = function() {
			var folderParams = {
				"name": $("#name", this).val(),
			};

			// callback
			if (commitCallback(folderParams)) {
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
	 * [popupBookmarkData description]
	 * @param  {Object} configure      {link: {url: "xxx", name: "xxx", description: "xxx"},
	 *                                 	window: {title: "ooo", commitBtnLabel: "ooo", cancelBtnLabel: "ooo"}
	 *                                 	} if not set will use default value.
	 * @param  {Function} commitCallback Parameter: Object: {url: "xxx", name: "xxx", description: "xxx"}, return true will close window.
	 */
	popupBookmarkData: function(configure, commitCallback) {
		configure = configure || {};

		// init link object
		var linkObj = configure["link"] || {};
		if (!linkObj["url"]) linkObj["url"] = "";  // url
		if (!linkObj["name"]) linkObj["name"] = "";  // name
		if (!linkObj["description"]) linkObj["description"] = "";  // description

		// init window object
		var windowObj = configure["window"] || {};
		if (!windowObj["title"]) windowObj["title"] = "Bookmark Data";  // title
		if (!windowObj["commitBtnLabel"]) windowObj["commitBtnLabel"] = "Submit";  // commit button label
		if (!windowObj["cancelBtnLabel"]) windowObj["cancelBtnLabel"] = "Cancel";  // cancel button label

		// html
		var htmlBody = '<form class="form-horizontal" role="form">' +
							'<div class="form-group">' +
								'<label for="url" class="control-label">URL:</label>' +
								'<input type="url" title="url" id="url" placeholder="URL..." class="form-control" value="' + linkObj["url"] + '">' +
							'</div>' +

							'<div class="form-group">' +
								'<label for="name" class="control-label">Name:</label>' +
								'<input type="text" title="name" id="name" placeholder="Name" class="form-control" value="' + linkObj["name"] + '">' +
							'</div>' +

							'<div class="form-group">' +
								'<label for="description" class="control-label">Description:</label>' +
								'<textarea title="description" id="description" placeholder="Description" class="form-control" rows="3">' + linkObj["description"] + '</textarea>' +
							'</div>' +
						'</form>';

		// buttons function
		var buttons = {};
		buttons[windowObj["commitBtnLabel"]] = function() {
			var bookmarkParams = {
				"url": $("#url", this).val(),
				"name": $("#name", this).val(),
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