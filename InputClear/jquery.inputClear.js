/**
 * Input Clear Plugin
 *
 * @author Karl Stanton
 * @version 0.1
 * @description
 *
 * Used as a global plugin to help with the 'input clear' requirements on input boxes.
 * i.e.: 'Enter Search Text Here', on click, will become ''... 
 *
 */

(function ($) {

	$.fn.inputClear = function (options) {

        	// Setup some defaults.
		var defaults = {
			text: 'Please enter text'
		};

		// Extend our default options with those provided.
		var opts = $.extend(defaults, options);

		return this.each(function () {

			var oSelf = $(this);

			oSelf.focus(function (e) {
		
				if (oSelf.val() === opts.text) {
					oSelf.val('');
				}
				oSelf.addClass('active');
				
			// On blur, replace the empty input box with the default text
			}).blur(function (e) {
		
				if (oSelf.val() === '') {
					oSelf.val(opts.text);
				}
				oSelf.removeClass('active');

			// Force the input box to be defaulted
			}).val(opts.text);

		});
		
	};
	
})(jQuery);
