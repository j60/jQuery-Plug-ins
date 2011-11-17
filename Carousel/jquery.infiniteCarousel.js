/**
 * Infinite Carousel
 *
 * @copyright	Fantasy Interactive
 * @author		Karl Stanton
 * @version		0.1 - Original prototype
 * @version		0.2 - Added class documentation
 * @version		0.3 - Added code documentation
 * @version		0.4 - Added check if number of items warrants pagination
 * @version		0.5	- Added page numbers
 * @version		0.6 - Added direction change for auto rotate after clicking next / back
 * @version		0.7 - Added rotation time
 *
 * The infinite carousels purpose is to allow the user to scroll through the
 * carousel items infinitely, no matter how many items exist in the item list.
 *
 * The carousel will not scroll if there are less items than
 *
 * oOptions.iPerPage + 1
 *
 * For example:
 *
 * If we are showing 5 items per 'page', there must be a minimum of 6 items for
 * the carousel to activate.
 *
 * Setup HTML:
 *
 * 	<div id="fullEpisodesSlider">
 * 		<ul>
 * 			<li> Item </li>
 * 			<li> Item </li>
 * 			<li> Item </li>
 *		</ul>
 * 	</div>
 *
 * Setup CSS:
 *
 * #fullEpisodesSlider {
 * 		overflow: hidden;
 * 		height: 360px;
 * 		width: 940px;
 * }
 *
 * #fullEpisodesSlider ul {
 * 		clear: both;
 * 		width: 10000px;
 * 		position: relative;
 * }
 *
 * #fullEpisodesSlider li {
 * 		width: 188px;
 * 		float: left;
 * 		position: relative;
 * }
 *
 *
 * Invoke by:
 *
 * var oClipsList = $('ul', '#fullEpisodesSlider').infiniteCarousel({
 * 		iPerPage: 5,
 * 		oNavigationNext: $('a.btnFullEpisodesNext', '#fullEpisodes'),
 * 		oNavigationPrevious: $('a.btnFullEpisodesPrevious', '#fullEpisodes'),
 *      iRotationTime: 1000
 * });
 *
 */
(function ($) {

	/**
	 * Infinite Carousel
	 * @constructor
	 * @param {Object} oCustomOptions
	 */
	$.fn.infiniteCarousel = function (oCustomOptions) {

		// Return if this element is not found
		if (!this[0]) {
			return;
		};

		var oDefaults = {
			iPerPage: 5,
			oNavigationNext: '',
			oNavigationPrevious: '',
			iAutoRotate: 0,
			iRotateDir: 1,
			bShowPageNumbers: false,
			iRotationTime: 500
		};

		var oOptions	= $.extend(oDefaults, oCustomOptions || {});

		// Global setInterval property
		var oRotateInterval;

		// Apply to each instance of the selected element(s)
		return this.each(function () {

			/**
			 * @globals
			 */
			var oContainer		= $(this),
				oItems			= oContainer.children(),
				iItemWidth		= oContainer.children(':first').outerWidth(),
				bAnimating		= false,
				iNumItems,
				iAnimationLength,
				oPageNumbers,

				// Buttons
				btnPrevious		= oOptions.oNavigationPrevious,
				btnNext			= oOptions.oNavigationNext,


			// The total number of items in the carousel
			iNumItems			= oItems.length;
			
			// Prepare the container
			oContainer.css({
				'position': 'relative',
				'left': 0
			});

			// If the number of items is less than or equal too the amount
			// required to view per page, then hide the pagination buttons
			// and exit the plugin
			if (iNumItems <= oOptions.iPerPage) {
				
				oOptions.oNavigationPrevious.hide();
				oOptions.oNavigationNext.hide();
				return;
				
			}
			// Kick off
			bindEvents();

			// If we are showing page numbers
			if (oOptions.bShowPageNumbers) {
				showPageNumbers();
			}

			setupAutoRotate();


			/**
			 * Binds events to the previous and next buttons, as well as
			 * stopping the carousel auto-rotate on hover
			 *
			 * @author Karl Stanton
			 */
			function bindEvents () {

				// Previous button
				btnPrevious.show().click(function (oEvent) {

					if (!bAnimating) {
						onPreviousNextClick(-1);
					}
					return false;

				}).hover(function () {
					clearInterval(oRotateInterval);
				}, function () {
					setupAutoRotate();
				});

				// Next button
				btnNext.show().click(function (oEvent) {

					if (!bAnimating) {
						onPreviousNextClick(1);
					}
					return false;

				}).hover(function () {
					clearInterval(oRotateInterval);
				}, function () {
					setupAutoRotate();
				});

				// Stop rotating on hover
				oContainer.hover(function () {
					clearInterval(oRotateInterval);
				}, function () {
					setupAutoRotate();
				});

			}

			/**
			 * Builds the page numbers elements out to the page. They will be placed
			 * between the "Previous" and the "Next" buttons.
			 * 
			 * @author Karl Stanton
			 */
			function showPageNumbers () {
			
				var sCurrent;
			
				// Begin the html build
				oPageNumbers = '<div class="pageNumbers">';
				
				// For each page, put in a page number
				for (var i = 0; i < iNumItems; i++) {
					
					if (i === 0) {
						sCurrent = ' class="current"';
					}
					else {
						sCurrent = '';
					}
					
					oPageNumbers += '<a href="#"' + sCurrent + '><span>' + (i + 1) + '</span></a>';
					
				}
				// Close the HTML
				oPageNumbers += '</div>';
				
				// Turn into jQuery object
				oPageNumbers = $(oPageNumbers);
				
				// Append after the Previous button (which will sit between
				// the previous button and the next button)
				oOptions.oNavigationPrevious.after(oPageNumbers);
				
				// Bind events to these anchors
				$('a', oPageNumbers).click(function () {
					
					var iSelfIndex		= $(this).index(),
						iCurrentIndex	= $('a.current', oPageNumbers).index(),
						iNewIndex		= iSelfIndex - iCurrentIndex;
					
					onPreviousNextClick(iNewIndex);
					
					return false;
					
				});
				
			}
			
			/**
			 * Selects the correct page number after a direction has been requested.
			 *
			 * @author Karl Stanton
			 * @param {Number} iDirection
			 */
			function moveSelectedPageNumber (iDirection) {
				
				// Get the currently selected element
				var oCurrent		= $('a.current', oPageNumbers),
					iCurrentIndex	= oCurrent.index();
				
				// If we're at the end, send it back to 0
				if (iCurrentIndex === (iNumItems - 1) && iDirection > 0) {
					iCurrentIndex = 0;
				}
				// If we're at the start, set to iNumItems - 1 (0 based)
				else if (iCurrentIndex === 0 && iDirection < 0) {
					iCurrentIndex = iNumItems - 1;
				}
				// Or just move it in the direction requested
				else {
					iCurrentIndex += iDirection;
				}
				
				oCurrent.removeClass('current');
				
				$('a:eq(' + (iCurrentIndex) + ')', oPageNumbers).addClass('current');
				
			}

			/**
			 * When the user clicks next or previous, depending on the iDirection
			 * the appropriate carousel logic will be applied. Please read the
			 * documentation above the iDirection condition for further detail.
			 *
			 * @author Karl Stanton
			 * @param {Number} iDirection
			 */
			function onPreviousNextClick (iDirection) {

				var iNewLeft,
					iOldLeft,
					iNumDistance;

				// Get the width and height set
				resetItemsAndWidth();

				// Update the Auto Rotate Direction
				oOptions.iRotateDir = iDirection;

				// We are animating, so prevent any further triggers
				bAnimating = true;
				
				// If the iDirection value is greater than 1, then we are jumping through
				// pages. We must then adjust our slicing parameters
				if (iDirection > 1 || iDirection < -1) {
					iNumDistance = iDirection;
				}
				else if (iDirection === 1) {
					iNumDistance = oOptions.iPerPage;
				}
				else if (iDirection === -1) {
					iNumDistance = -oOptions.iPerPage;
				}

				// Update the animation length variable
				iAnimationLength = iItemWidth * iNumDistance;
					
					
				// For when the user clicks Previous
				if (iDirection < 0) {
					iNewLeft = prepareCarouselPrevious(iNumDistance);
				}
				// For when the user clicks Next
				else {
					iNewLeft = prepareCarouselNext(iNumDistance);
				}
				
				// Set the page number
				if (oOptions.bShowPageNumbers) {
					moveSelectedPageNumber(iDirection);
				}
				
				// Animate the carousel
				oContainer.animate({
					left:	iNewLeft
				}, oOptions.iRotationTime, function () {

					// Depending on the direction, we must remove the old items from the DOM

					// Previous
					if (iDirection < 0) {

						// Remove anything that's greater than the original number
						// of items (-1 to get to 0 base indexing of elements)
						oItems.filter(':gt(' + (iNumItems - 1) + ')').remove();

					}
					// Next
					else {

						// Remove anything less than oOptions.iPerPage and adjust
						// the left position to return to 0
						oItems.filter(':lt(' + (iNumDistance) + ')').remove();
						oContainer.css('left', 0);

					}

					// Reset
					resetItemsAndWidth();

					// We have finished the animation process. So drop the flag
					bAnimating = false;

				});

			}

			/**
			 * Reset the oItems variable with the updated amount of children
			 * elements
			 *
			 * Adjust the width of the carousel
			 */
			function resetItemsAndWidth () {

				oItems = oContainer.children();
				
				// Reset the width and animation length if the width was never found at build
				if (iItemWidth === 0) {
					
					iItemWidth			= oContainer.children(':first').outerWidth();
					
					iAnimationLength	= iItemWidth * oOptions.iPerPage;
					
				}

				oContainer.width(oItems.length * iItemWidth);

			}

			/**
			 * Prepares the carousel for moving to the RIGHT
			 *
			 * Since the carousel is animating RIGHT, we need to make some
			 * adjustments to the carousel before we animate.
			 *
			 * We have to copy the last (iNumDistance) items and place
			 * them at the beginning of the carousel, then adjust the left
			 * position of the carousel to compensate for the new items.
			 *
			 * The user won't see the update happen, however the carousel
			 * will now have a cloned version of itself on the left hand side
			 * ready for animation.
			 *
			 * 1) Set our left variables based on the above activity
			 * 2) Clone the elements
			 * 3) Adjust the width and left position of the carousel
			 * 
			 * @author Karl Stanton
			 * @param {Number} iNumDistance
			 * @return {Number} iNewLeft
			 */
			function prepareCarouselPrevious (iNumDistance) {

				var iOldLeft,
					iNewLeft;

				// Set the current position
				iCurrentPosition = oContainer.position().left;

				// The old left position is the current position minus the
				// animation length
				iOldLeft		= iAnimationLength;

				// The new left position will be the current position
				iNewLeft		= iCurrentPosition;

				// Clone the elements
				oItems.filter(':first').before(oItems.slice(iNumDistance).clone(true));

				resetItemsAndWidth();

				oContainer.css('left', iOldLeft);

				return iNewLeft;
				
			}

			/**
			 * Prepares the carousel for moving to the LEFT
			 *
			 * Since the carousel is moving to the left, we have to copy
			 * the first (iNumDistance) items and place them after
			 * the last item.
			 *
			 * Since the left position will remain the same, all that's
			 * left to do is adjust the width of the carousel to compensate
			 * for the newly added items.
			 * 
			 * @author Karl Stanton
			 * @param {Number} iNumDistance
			 * @return {Number} iNewLeft
			 */
			function prepareCarouselNext (iNumDistance) {

				// The new left position is the current position minus
				// the length of animation length. So we just pass back
				// the animation length
				var iNewLeft	= -(iAnimationLength);

				// Copy the first oOptions.iPerPage items and append them to
				// the end of the carousel
				oItems.filter(':last').after(oItems.slice(0, iNumDistance).clone(true));

				resetItemsAndWidth();

				return iNewLeft;

			}

			/**
			 * Sets up the auto rotate timer
			 *
			 * @author Karl Stanton
			 */
			function setupAutoRotate () {

				// Auto Rotate?
				if (oOptions.iAutoRotate > 0) {

					oRotateInterval = setInterval(function(){
						onPreviousNextClick(oOptions.iRotateDir)
					}, oOptions.iAutoRotate);

				} else {

					oRotateInterval = setInterval(function () {}, oOptions.iAutoRotate);

				}

			}

		});

		return this;

	};

})(jQuery);





