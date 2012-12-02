var city = "Dublin";
var utctime = 0;

// fixed
var hidden, visibilityChange; 
var isMobile = false;
var isActive = true;
var max_photos = 50;
var photos = new Array();
var photosQueue = [];
var photosQueueInterval;
var photosref = new Dictionary;
var preloader;
var timestart;
var socket;
var state = 0;

window.requestInterval = function(fn, delay) {
    if( !window.requestAnimationFrame       && 
        !window.webkitRequestAnimationFrame && 
        !window.mozRequestAnimationFrame    && 
        !window.oRequestAnimationFrame      && 
        !window.msRequestAnimationFrame)
            return window.setInterval(fn, delay);

    var start = new Date().getTime(),
    handle = new Object();

    function loop() {
        var current = new Date().getTime(),
        delta = current - start;

        if(delta >= delay) {
            fn.call();
            start = new Date().getTime();
        }

        handle.value = requestAnimFrame(loop);
    };

    handle.value = requestAnimFrame(loop);
    return handle;
}

window.clearRequestInterval = function(handle) {
    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
    window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) :
    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
    window.oCancelRequestAnimationFrame ? window.oCancelRequestAnimationFrame(handle.value) :
    window.msCancelRequestAnimationFrame ? msCancelRequestAnimationFrame(handle.value) :
    clearInterval(handle);
};

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

/*! A fix for the iOS orientationchange zoom bug. Script by @scottjehl, rebound by @wilto.MIT License.*/(function(m){if(!(/iPhone|iPad|iPod/.test(navigator.platform)&&navigator.userAgent.indexOf("AppleWebKit")>-1)){return}var l=m.document;if(!l.querySelector){return}var n=l.querySelector("meta[name=viewport]"),a=n&&n.getAttribute("content"),k=a+",maximum-scale=1",d=a+",maximum-scale=10",g=true,j,i,h,c;if(!n){return}function f(){n.setAttribute("content",d);g=true}function b(){n.setAttribute("content",k);g=false}function e(o){c=o.accelerationIncludingGravity;j=Math.abs(c.x);i=Math.abs(c.y);h=Math.abs(c.z);if(!m.orientation&&(j>7||((h>6&&i<8||h<8&&i>6)&&j>5))){if(g){b()}}else{if(!g){f()}}}m.addEventListener("orientationchange",f,false);m.addEventListener("devicemotion",e,false)})(this);
$(document).ready(function(){
    checkDevice();
    
    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    init();
    initConnection();
    document.addEventListener(visibilityChange, handleVisibilityChange, false);
    //document.addEventListener("webkitvisibilitychange", handleVisibilityChange, false);
    if (!document.webkitHidden) isActive = true;
});

function checkDevice() {
    if (navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/) || 
        navigator.userAgent.match(/Windows Phone/i) || 
        navigator.userAgent.match(/ZuneWP7/i)
        ) {
            isMobile = true;
            max_photos = 60;
    }
}

function handleVisibilityChange() {  
    if (document[hidden]) {  
        if(photosQueueInterval)clearRequestInterval(photosQueueInterval);
        var a = photosQueue.concat(photos);
        photos = a;
        photosQueue = [];
        
        if(!isMobile){ reorder(); } else { reorderMobile(); };
        isActive = false;
    } else {
        isActive = true;
    }
} 

function init(){
    window.onresize = updateCanvasSize;
    updateCanvasSize();
    timestart =  moment();
    timestart.utc();
    if(utctime > 0) {
        timestart.add("hours", utctime);
    }else {
        timestart.subtract("hours",  Math.abs(utctime));
    }
    setTime();
    align_top();
    requestInterval(setTime, 1000);
    preloader = $('<div/>').html("<br /><br />Talking to Instagram... <br /> <br /> <img src='/img/preloader.gif' align='middle'/>").addClass("preloader").appendTo('.preloadBox');
    TweenMax.to( preloader, 0, {css:{left: 150}});
    TweenMax.to( preloader, 0.9, {css:{left: 450}, ease:Quad.easeOut});
}

/**
 * Update the clock time
 */
function setTime() {
    var time = moment();
    time.utc();
    if(utctime > 0) {
        time.add("hours", utctime);
    }else {
        time.subtract("hours",  Math.abs(utctime));
    }
    //console.log(time.format("dddd, MMMM Do YYYY, h:mm:ss a Z")); // "Sunday, February 14th 2010, 3:25:50 pm"
    $('#date').html(time.format("dddd, MMMM Do YYYY"));
    if(isMobile){
        $('#clock').html(time.format("h:mm a"));
    }else {
        $('#clock').html(time.format("h:mm:ss a"));
    }
    $("span.timeelapsed").html(time.from(timestart,true));
}

function addPhoto(data) {
    // if its a new ID
    if (photosref.add(data.id)) {
        var photo = new Photo();
        photo.id = data.id;
        photo.load(data.url, data.link, isMobile);
        $(photo.content).data("info", { link: data.link, id:data.id });
        $(photo.content).click(function() {
            onPhotoClick($(this).data("info"));
        });

        if(isActive) {
            photosQueue.push(photo.content);
            if(!isMobile) {
                TweenMax.to($('#clock'), 0, {css:{opacity:1}});
                TweenMax.from($('#clock'), 0.3, {css:{opacity:0.3, ease:Quad.easeInOut}});
            }else {
                TweenMax.to($(photo.content), 0, {css:{display:none}});
            }
            if(photosQueue.length == 1){
                if(photosQueueInterval)clearRequestInterval(photosQueueInterval);
                photosQueueInterval = requestInterval(checkPhotosQueue, 450);
            }
        }else {
            photos.unshift(photo.content);
            TweenMax.to( photo.content, 0, {css:{left: 300}});
            if(photos.length > max_photos) {
                var item = photos.pop();
                // remove the ID from the dictionary
                photosref.remove($(item).data("info").id);
                $(item).remove();
            }
            if(!isMobile){ reorder(); } else { reorderMobile(); };
        }
    }
}

function checkPhotosQueue() {
    if(photosQueue.length > 0){
        //remove the first element from the queue
        var photo = photosQueue.shift();
        photos.unshift(photo);
        TweenMax.to( photo, 0, {css:{left: 300}});
        if(photos.length > max_photos) {
            var item = photos.pop();
            photosref.remove($(item).data("info").id);
            $(item).remove();
        }
        if(isActive) {
            if(!isMobile){ pushPhotos() } else { pushPhotosMobile() };
        }else {
            if(photosQueueInterval)clearRequestInterval(photosQueueInterval);
            if(!isMobile){ reorder(); } else { reorderMobile(); };
        }
    }else{
        clearRequestInterval(photosQueueInterval);
    }
}

function onPhotoClick(data) {
    //console.log("onPhotoClick", data.link, data.id);
    socket.emit('photo clicked', {});
    window.open(data.link,"_blank");
}

function pushPhotos() {
    var distance = 0;
    var xp = 300
    var yp = 0
    for (var i = 0; i < photos.length; i++) {
        var mc = photos[i];
        if(xp > window.innerWidth) {
            TweenMax.to( mc, 0, {css:{left: -150}});
            xp = -150;
            yp += 150 + distance;
        }
        TweenMax.to( mc, 0, {css:{top: yp + distance}});
        xp += 150+ distance;
        TweenMax.to( mc, 0.4, {css:{left: xp}, ease:Quad.easeOut});
    }
}

function pushPhotosMobile() {
    for (var i = 0; i < photos.length; i++) {
        TweenMax.to($(photos[i]), 0, {css:{display:block}});
    };
}

function updateCanvasSize() {
    reorder();
}

function reorder() {
    var xp = 300;
    var yp = 0;
    var distance = 0;
    for (var i = 0; i < photos.length; i++) {
        var mc = photos[i];
        if(xp > window.innerWidth) {
            TweenMax.to( mc, 0, {css:{left: -150}});
            xp = -150;
            yp += 150 + distance;
        }
        TweenMax.to( mc, 0, {css:{top: yp}});
        xp += 150 + distance;
        TweenMax.to( mc, 0, {css:{left: xp}, ease:Quad.easeInOut});
    };
    align_top();
}

function reorderMobile() {
    align_top();
}

function align_top() {
    var t = 0;
    if(state==1) {
    }else{
    }
}


function initConnection() {
    var url = "ws://" + document.URL.substr(7).split('/')[0];
    socket = io.connect(url);

    socket.on("connect", function() {
        console.log("CLIENT: connected to the server");
    });

    socket.on("add photo", function(update) {
        addPhoto(update);
    });
    socket.on("init", function(data) {
        preloader.remove();
        //for (var i = 0; i < data.length; i++) {
            //if ( photosref.add(data[i].id) ) {
                //var photo = new Photo();
                //photo.id= data[i].id;
                //photo.load(data[i].url, data[i].link, isMobile);
                //$(photo.content).data("info", { link: data[i].link, id:data[i].id });
                //$(photo.content).click(function() {
                    //onPhotoClick($(this).data("info"));
                //});
                //photos.push(photo.content);
            //}
        //};
        
        if(!isMobile){ reorder(); } else { reorderMobile(); };
    });
}


