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
					Ok: function() {
				  		$(this).dialog("close");
					}
				}
			});
	}
};