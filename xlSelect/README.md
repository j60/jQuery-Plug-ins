What does it do?
================

It creates a custom select dropdown

How does it work?
=================

It creates a styled div with LIs reflecting the options of the select element and hides the select. The LIs and the options element are in sync but a click on the LI won't trigger a click on the option (to be done)


Add the js and css files in your HTML's head: 
=============================================

    <script type="text/javascript" src="http://code.jquery.com/jquery-1.7.min.js"></script>
    <script src="/xlselect.jquery.js" type="text/javascript"></script>
    <link type="text/css" media="screen" href="/xlselect.css" rel="stylesheet" />

The basic syntax to add a module is the following:
==================================================

    $("select.need_to_be_custom").xlSelect()

Options with default:
=====================

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
    selectCallback: null

Example with options:
=====================

    $("select.custom_with_options").xlSelect({
      preHtml: "<span class='icon-xl-dropdown-arrow'></span>",
      expandCallback: function() {
        return this.find(".icon-xl-dropdown-arrow").removeClass().addClass("icon-xl-dropdown-arrow-selected");
      },
      collapseCallback: function() {
        return this.find(".icon-xl-dropdown-arrow-selected").removeClass().addClass("icon-xl-dropdown-arrow");
      },
      selectCallback: function() {
        return this.closest("form").submit();
      }
    });

You can try the XL theme by adding xltheme.css and the .xl class to your select

Tested on IE7+, FF 3.6+, Chrome, Safari