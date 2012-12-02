// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function noop() {};
    var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
} ());

// Place any jQuery/helper plugins in here.

var Dictionary = function() {
    this.length = 0;
    this.list = {};
    // it doesnt store values just unique keys to check
    this.add = function(key) {
        if (!this.list[key]) {
            // new ref
            this.list[key] = 1;
            this.length++;
            return true;
        }
        // exists
        return false;
    };
    this.remove = function(key) {
        if (this.list[key]) {
            delete this.list[key];
            this.length--;
            return true;
        }
        return false;
    };
};
function Photo() {
    this.id = "";
    var self = this;
    this.content = $('<div/>')
        this.load = function(img, url, isMobile){
            if(!isMobile) {
                this.content = $('<div/>').html('<a href="#"><img src="'+img+'" /></a>').addClass("photo").appendTo('#gallery')
            }else {
                this.content = $('<div/>').html('<a href="#"><img src="'+img+'" /></a>').addClass("photoMobile").prependTo('#gallery')
            }
        }
}


