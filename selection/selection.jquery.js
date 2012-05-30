/* jQuery set Selection plugin
 * Version: 1.0 (05/29/2012)
 * No license. Use it however you want. Just keep this notice included.
 * Author: Stanislas Duprey
 */
(function($) {
  $.fn.setSelection = function(givenOptions) {
    function setSelectionRange(input, selectionStart, selectionEnd) {
      if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
      }
      else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
      }
    }

    return this.each(function() {
      var options = $.extend({
            start: 0,
            end: 0
          }, givenOptions);
      setSelectionRange(this, options.start, options.end);
    });
  }
})(jQuery);