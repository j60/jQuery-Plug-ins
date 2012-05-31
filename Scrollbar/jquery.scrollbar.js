/**
 * Custom Scrollbar Plugin
 *
 * @param {Object} selector
 * @param {Object} options (See oDefaults)
 *
 */
(function ($) {

	var ScrollBar = function (selector, options) {
	
		this.selector	= selector;
		this.oOptions	= options;
		this.init();
	
	}
	
	ScrollBar.prototype = {
	
		init: function () {
			console.log(this.oOptions)
			this.createScrollbar();
			this.bindEventListeners();
			this.setScrollbarToPosition();

		},
		
		createScrollbar: function () {
		
			// Set up our elements
			this.oOptions.oContainer	= this.selector;

			this.scrollableItem			= $(this.oOptions.oContainer).children();
			
			// Create HTML scrollbar
			this.oOptions.oContext.append('<div class="scrollbar"><div class="scrubber"></div></div>');

			// Get this instance of the scrollbar			
			this.scrollbar				= this.oOptions.oContext.find('.scrollbar');
				
			// Now the scrubber
			this.scrollbarScrubber		= this.scrollbar.find('.scrubber');
		
		},
		
		bindEventListeners: function () {
			
			var _this = this;
		
			// On mouse down...
			this.scrollbar.bind('mousedown', function (e) {

				if (_this.oOptions.isHorizontal) {

					// If the mouse is NOT pressed down on the scrubber, we need to move the scrubber to where the mouse currently is
					if (!$(e.target).hasClass('scrubber')) {
						_this.scrollbarScrubber.css('left', e.clientX - _this.scrollbar.offset().left - (_this.scrollbarScrubber.width() * 0.5));
					}

					scrubberXOffset = e.clientX - _this.scrollbarScrubber.position().left;
				
				}
				else {
				
					if (!$(e.target).hasClass('scrubber')) {
						_this.scrollbarScrubber.css('top', e.clientY - _this.scrollbar.offset().top - (_this.scrollbarScrubber.height() * 0.5));
					}
	
					scrubberYOffset = e.clientY - _this.scrollbarScrubber.position().top;

				}
	
				$(document).bind('mousemove', updateScroll);
				$(document).bind('mouseup',	scrollBarMouseUp);
				
				// Trigger an initial update of content positioning to make sure it is in sync with where the scrubber is
				updateScroll(e);
					
				return false;

			});
		
			function scrollBarMouseUp (e) {
	
				$(document).unbind('mousemove', updateScroll);
				$(document).unbind('mouseup', scrollBarMouseUp);
				
			}
			
			function updateScroll (event) {
	
				var scrollWidth, scrollHeight,
					scrubberX, scrubberY,
					contentX, contentY,
					scrollScale, scrubberDimension;
	
				if (_this.oOptions.isHorizontal) {
				
					scrubberDimension = _this.scrollbarScrubber.width();
	
					// Determine the height of the scrollbar
					scrollWidth = _this.scrollbar.width();
		
					// Calculate the position to move the scrubber to (within max/min bounds)
					scrubberX = Math.max(Math.min(event.clientX - scrubberXOffset, scrollWidth - scrubberDimension), 0);
		
					// Calculate the scroll scale, ranged from 0-1 where 1 is the full bottom scroll
					scrollScale = scrubberX / (scrollWidth - scrubberDimension);
		
					// Calculate the new position to move the content to [ x * (totalWidth - windowWidth) ]
					contentX = -scrollScale * (_this.scrollableItem.width() - _this.oOptions.oContainer.width());
		
					_this.scrollbarScrubber.css('left', scrubberX);
					_this.scrollableItem.css('left', contentX);
					
				}
				else {
				
					scrubberDimension = _this.scrollbarScrubber.height();
	
					// Determine the height of the scrollbar
					scrollHeight = _this.scrollbar.height();
		
					// Calculate the position to move the scrubber to (within max/min bounds)
					scrubberY = Math.max(Math.min(event.clientY - scrubberYOffset, scrollHeight - scrubberDimension), 0);
		
					// Calculate the scroll scale, ranged from 0-1 where 1 is the full bottom scroll
					scrollScale = scrubberY / (scrollHeight - scrubberDimension);
		
					// Calculate the new position to move the content to [ x * (totalWidth - windowWidth) ]
					contentY = -scrollScale * (_this.scrollableItem.height() - _this.oOptions.oContainer.height());
					
					//console.log(scrollableItem);	
					_this.scrollbarScrubber.css('top', scrubberY);
					_this.scrollableItem.css('top', contentY);
				
				}
		
				// tell the world we're scrolling
				_this.scrollableItem.trigger('scroll');
					
			}
		
		},
		
		setScrollbarToPosition: function () {

			var iScrolledContentPosition,
				iNewPosition;

			if (this.oOptions.isHorizontal) {
				
				// jQuery.position().left is wrong. So we get the CSS style
				iScrolledContentPosition	= this.oOptions.oContainer.children(':first').css('left').split('px')[0];
				
				// Then use that to figure out the percentage of how far we're scrolled
				iScrolledContentPosition	= Math.abs(iScrolledContentPosition / (this.oOptions.oContainer.width() - this.oOptions.oContainer.children(':first').width()));

				iNewPosition				= iScrolledContentPosition * (this.scrollbar.innerWidth() - this.scrollbarScrubber.outerWidth());

				this.scrollbarScrubber.css('left', iNewPosition);
				
			}
			else {
			
				iScrolledContentPosition	= -(this.oOptions.oContainer.children(':first').position().top / this.oOptions.oContainer.height());
				iNewPosition				= iScrolledContentPosition * (Math.max(Math.min(this.scrollbar.height() - this.scrollbarScrubber.height()), 0));

				this.scrollbarScrubber.css('top', iNewPosition);		
					
			}

		}
		
	};
	
	$.fn.scrollbar = function (options) {
		
		var defaults = {
			isHorizontal: true,
			oContext: {}
		}
		
		var options = $.extend(defaults, options);
		
		return new ScrollBar(this, options);
		
	};

})(jQuery);