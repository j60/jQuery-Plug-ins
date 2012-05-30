// jQuery xlSelect Plugin
// version 0.2, May 30th, 2012
// by Stanislas Duprey


(function($) {

    $.fn.xlSelect = function(options) {
      // public methods to be called from outside the pulgin
      var methods = {
        reset: function(){
          if (isCustom) {
            var title = this.attr("placeholder");
            this.next().removeClass("selected").find(".title").html(title);
          } else {
            this.find("option").removeAttr("selected").first().attr("selected", "selected")
          }
          return this;
        },
        disable: function(){
          this.attr("disabled", "disabled")
          if (isCustom) this.next().attr("disabled", "disabled");
          return this;
        },
        enable: function(){
          this.removeAttr("disabled")
          if (isCustom) this.next().removeAttr("disabled");
          return this;
        }
      }
      var $window = $(window);

      var isCustom = typeof navigator == "undefined" || (!/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

      // if options is a tsring then its trying to call a public method
      if (typeof options === "string") return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
      var settings = $.extend({
        // preHtml will be put before the select label (typically used to put a dropdown arrow)
        preHtml: "",
        // preHtml will be put after the select label (typically used to put a dropdown arrow)
        postHtml: "",
        // set this to false if you don't want the select to take the selected option as label, and leave the value of the select's placehodler attribute
        changeTitle: true,
        // function called when you open the dropdown
        expandCallback: null,
        // function called when you close the dropdown
        collapseCallback: null,
        // function called when you select an item in the dropdown
        selectCallback: null,
        // function called when init is done
        init: null,
        // set the max height of the select dropdown so that it never goes passed the window
        overflowScroll: true
      }, options);

      function getReplacementHTML($select) {
        var style = $select.attr("style") || "";
        var classes = $select.attr("class") || "";
        var $optionEls = $select.children();
        // title is either a default value, the value of the placeholder attribute in the select, or the selected item if any
        var title = $select.attr("placeholder") || "Select an option";
        var $selectedOption = $select.find("[selected='selected']");
        if ($selectedOption.length>0) {
          title = $selectedOption.html();
          classes += " selected";
        }
        var disabled = ($select.is(":disabled")) ? " disabled='disabled'" : "";
        // main div container to replace the select
        var $container = $("<div class='xlselect "+classes+"'"+disabled+" style='"+style+"'>"+settings.preHtml+"<p class='title'>"+title+"</p>"+settings.postHtml+"<ul></ul></div>");
        // dropdown items replacement
        var lis = "";
        for (var i=0, len=$optionEls.length; i<len; i++) {
          var $option = $($optionEls[i]);
          // the default option (usually "all") must have value === "placeholder"
          // and if you want this option to be available in the custom drop down, add the attribute displayOnly
          if (true || $option.val() != "placeholder" || typeof $option.attr("displayAlways") != "undefined") {
            var attrs = "";
            for (var attr, j=0, attrNodes=$optionEls[i].attributes, l=attrNodes.length; j<l; j++){
              attr = attrNodes.item(j)
              if (attr.nodeName != "value" && attr.nodeName != "id" && attr.nodeName != "selected" && attr.nodeValue) attrs += " "+attr.nodeName+"='"+attr.nodeValue+"'";
            }
            lis += "<li data-value='"+$option.val()+"'"+attrs+">"+$option.html()+"</li>";
          }
        }
        $container.find("ul").append(lis);
        // if there is a selected value, highlight it in the dropdown
        var selectedValue = $selectedOption.val();
        if (typeof selectedValue != "undefined") $container.find("[data-value='"+selectedValue+"']").addClass("selected");
        return $container;
      }
      
      function setMaxHeight($el){
        var $ul = $el.find("ul");
        $ul.css("max-height", "none");
        if ($ul.offset().top + $ul.height() > $window.scrollTop() + $window.height()) {
          $ul.css("max-height", $window.scrollTop() + $window.height() - $ul.offset().top - 10);
        }
      }
      
      function activate($newSelect, $select) {
        $newSelect.find("li").click(function(e){
          var $li = $(this);
          var $container = $li.closest(".xlselect");
          var $select = $container.prev();
          // select the right option in the (invisible) select
          // and forward the click event
          $select.find("option").removeAttr("selected");
          $select.find("[value='"+$li.attr("data-value")+"']").attr("selected", "selected").click();
          // add selected class to the fake select
          $container.find("li").removeClass("selected");
          $li.addClass("selected");
          // change the title with the name of the select
          if (settings.changeTitle) {
            $container.find("p.title").text($li.text());
            $newSelect.addClass("selected");
          }
          $select.trigger("change")
          e.stopPropagation();
        })
        $newSelect.find("ul").bind('mousewheel', function(e, d) {
          var $this = $(this),
              height = $this.height(),
              scrollHeight = $this.get(0).scrollHeight;
          if((this.scrollTop === (scrollHeight - height) && d < 0) || (this.scrollTop === 0 && d > 0)) { e.preventDefault(); }
        });
        $newSelect.click(function(e){
          if ($newSelect.attr("disabled")!="disabled") toggleSelect($newSelect);
          e.stopPropagation();
        });
        $(document).click(function(e){ if ($newSelect.hasClass("expanded")) toggleSelect($newSelect); });
      }
      
      function toggleSelect($el) {
        // display/hide
        $el.find("ul").toggle();
        if ($el.hasClass("expanded")) {
          // collapse callback
          if (typeof settings.expandCallback === "function") settings.collapseCallback.call($el)
          // z-index fix
          $el.css("z-index", $el.attr("data-zIndex"));
        } else {
          // set max height depending on the size of the window
          if (settings.overflowScroll) { setMaxHeight($el); }
          // expand callback
          if (typeof settings.collapseCallback === "function") settings.expandCallback.call($el);
          // z-index fix
          $el.attr("data-zIndex", $el.css("z-index"));
          $el.css("z-index", 500);
          // if you expand a select while another select is expanded, you need to collapse the other one
          var $expandedSelects = $(".xlselect.expanded");
          if ($expandedSelects.length>0) toggleSelect($expandedSelects);
        }
        // add/remove expanded class
        $el.toggleClass("expanded");
      }
      return this.each(function() {
        var $select = $(this);
        $select.change(function(){
          // callback action if any
          if (typeof settings.selectCallback === "function") settings.selectCallback.call($(this));
        });
        if (isCustom) {
          var $newSelect = getReplacementHTML($select);
          $select.hide().after($newSelect);
          activate($newSelect,$select);
        }
        var placeholder = $select.attr("placeholder");
        if (typeof placeholder != "undefined" && $select.find("[value=placeholder]").length === 0) {
          selected = (typeof $newSelect == "undefined" || $newSelect.find(".selected").length>0) ? "" : " selected='selected'";
          $select.prepend("<option"+selected+" value='placeholder'>"+placeholder+"</option>");
        }
        // init callback
        if (typeof settings.init === "function") {
          settings.init.call($select);
        }
      });
    }

})(jQuery);
