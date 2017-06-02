/**
 * Created by Administrator on 2017/5/15.
 * jquery metismenu,slimScroll,pace
 */
/*
 * metismenu - v1.1.3
 * Easy menu jQuery plugin for Twitter Bootstrap 3
 * https://github.com/onokumus/metisMenu
 *
 * Made by Osman Nuri Okumus
 * Under MIT License
 */
;(function($, window, document, undefined) {

  var pluginName = "metisMenu",
    defaults = {
      toggle: true,
      doubleTapToGo: false
    };

  function Plugin(element, options) {
    this.element = $(element);
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  Plugin.prototype = {
    init: function() {

      var $this = this.element,
        $toggle = this.settings.toggle,
        obj = this;

      if (this.isIE() <= 9) {
        $this.find("li.active").has("ul").children("ul").collapse("show");
        $this.find("li").not(".active").has("ul").children("ul").collapse("hide");
      } else {
        $this.find("li.active").has("ul").children("ul").addClass("collapse in");
        $this.find("li").not(".active").has("ul").children("ul").addClass("collapse");
      }

      //add the "doubleTapToGo" class to active items if needed
      if (obj.settings.doubleTapToGo) {
        $this.find("li.active").has("ul").children("a").addClass("doubleTapToGo");
      }

      $this.find("li").has("ul").children("a").on("click" + "." + pluginName, function(e) {
        e.preventDefault();

        //Do we need to enable the double tap
        if (obj.settings.doubleTapToGo) {

          //if we hit a second time on the link and the href is valid, navigate to that url
          if (obj.doubleTapToGo($(this)) && $(this).attr("href") !== "#" && $(this).attr("href") !== "") {
            e.stopPropagation();
            document.location = $(this).attr("href");
            return;
          }
        }

        $(this).parent("li").toggleClass("active").children("ul").collapse("toggle");

        if ($toggle) {
          $(this).parent("li").siblings().removeClass("active").children("ul.in").collapse("hide");
        }

      });
    },

    isIE: function() { //https://gist.github.com/padolsey/527683
      var undef,
        v = 3,
        div = document.createElement("div"),
        all = div.getElementsByTagName("i");

      while (
        div.innerHTML = "<!--[if gt IE " + (++v) + "]><i></i><![endif]-->",
          all[0]
        ) {
        return v > 4 ? v : undef;
      }
    },

    //Enable the link on the second click.
    doubleTapToGo: function(elem) {
      var $this = this.element;

      //if the class "doubleTapToGo" exists, remove it and return
      if (elem.hasClass("doubleTapToGo")) {
        elem.removeClass("doubleTapToGo");
        return true;
      }

      //does not exists, add a new class and return false
      if (elem.parent().children("ul").length) {
        //first remove all other class
        $this.find(".doubleTapToGo").removeClass("doubleTapToGo");
        //add the class on the current element
        elem.addClass("doubleTapToGo");
        return false;
      }
    },

    remove: function() {
      this.element.off("." + pluginName);
      this.element.removeData(pluginName);
    }

  };

  $.fn[pluginName] = function(options) {
    this.each(function () {
      var el = $(this);
      if (el.data(pluginName)) {
        el.data(pluginName).remove();
      }
      el.data(pluginName, new Plugin(this, options));
    });
    return this;
  };

})(jQuery, window, document);

/*! Copyright (c) 2011 Piotr Rochala (http://rocha.la)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.3.8
 *
 */
(function($) {

  $.fn.extend({
    slimScroll: function(options) {

      var defaults = {

        // width in pixels of the visible scroll area
        width : 'auto',

        // height in pixels of the visible scroll area
        height : '250px',

        // width in pixels of the scrollbar and rail
        size : '7px',

        // scrollbar color, accepts any hex/color value
        color: '#000',

        // scrollbar position - left/right
        position : 'right',

        // distance in pixels between the side edge and the scrollbar
        distance : '1px',

        // default scroll position on load - top / bottom / $('selector')
        start : 'top',

        // sets scrollbar opacity
        opacity : .4,

        // enables always-on mode for the scrollbar
        alwaysVisible : false,

        // check if we should hide the scrollbar when user is hovering over
        disableFadeOut : false,

        // sets visibility of the rail
        railVisible : false,

        // sets rail color
        railColor : '#333',

        // sets rail opacity
        railOpacity : .2,

        // whether  we should use jQuery UI Draggable to enable bar dragging
        railDraggable : true,

        // defautlt CSS class of the slimscroll rail
        railClass : 'slimScrollRail',

        // defautlt CSS class of the slimscroll bar
        barClass : 'slimScrollBar',

        // defautlt CSS class of the slimscroll wrapper
        wrapperClass : 'slimScrollDiv',

        // check if mousewheel should scroll the window if we reach top/bottom
        allowPageScroll : false,

        // scroll amount applied to each mouse wheel step
        wheelStep : 20,

        // scroll amount applied when user is using gestures
        touchScrollStep : 200,

        // sets border radius
        borderRadius: '7px',

        // sets border radius of the rail
        railBorderRadius : '7px'
      };

      var o = $.extend(defaults, options);

      // do it for every element that matches selector
      this.each(function(){

        var isOverPanel, isOverBar, isDragg, queueHide, touchDif,
          barHeight, percentScroll, lastScroll,
          divS = '<div></div>',
          minBarHeight = 30,
          releaseScroll = false;

        // used in event handlers and for better minification
        var me = $(this);

        // ensure we are not binding it again
        if (me.parent().hasClass(o.wrapperClass))
        {
          // start from last bar position
          var offset = me.scrollTop();

          // find bar and rail
          bar = me.siblings('.' + o.barClass);
          rail = me.siblings('.' + o.railClass);

          getBarHeight();

          // check if we should scroll existing instance
          if ($.isPlainObject(options))
          {
            // Pass height: auto to an existing slimscroll object to force a resize after contents have changed
            if ( 'height' in options && options.height == 'auto' ) {
              me.parent().css('height', 'auto');
              me.css('height', 'auto');
              var height = me.parent().parent().height();
              me.parent().css('height', height);
              me.css('height', height);
            } else if ('height' in options) {
              var h = options.height;
              me.parent().css('height', h);
              me.css('height', h);
            }

            if ('scrollTo' in options)
            {
              // jump to a static point
              offset = parseInt(o.scrollTo);
            }
            else if ('scrollBy' in options)
            {
              // jump by value pixels
              offset += parseInt(o.scrollBy);
            }
            else if ('destroy' in options)
            {
              // remove slimscroll elements
              bar.remove();
              rail.remove();
              me.unwrap();
              return;
            }

            // scroll content by the given offset
            scrollContent(offset, false, true);
          }

          return;
        }
        else if ($.isPlainObject(options))
        {
          if ('destroy' in options)
          {
            return;
          }
        }

        // optionally set height to the parent's height
        o.height = (o.height == 'auto') ? me.parent().height() : o.height;

        // wrap content
        var wrapper = $(divS)
          .addClass(o.wrapperClass)
          .css({
            position: 'relative',
            overflow: 'hidden',
            width: o.width,
            height: o.height
          });

        // update style for the div
        me.css({
          overflow: 'hidden',
          width: o.width,
          height: o.height
        });

        // create scrollbar rail
        var rail = $(divS)
          .addClass(o.railClass)
          .css({
            width: o.size,
            height: '100%',
            position: 'absolute',
            top: 0,
            display: (o.alwaysVisible && o.railVisible) ? 'block' : 'none',
            'border-radius': o.railBorderRadius,
            background: o.railColor,
            opacity: o.railOpacity,
            zIndex: 90
          });

        // create scrollbar
        var bar = $(divS)
          .addClass(o.barClass)
          .css({
            background: o.color,
            width: o.size,
            position: 'absolute',
            top: 0,
            opacity: o.opacity,
            display: o.alwaysVisible ? 'block' : 'none',
            'border-radius' : o.borderRadius,
            BorderRadius: o.borderRadius,
            MozBorderRadius: o.borderRadius,
            WebkitBorderRadius: o.borderRadius,
            zIndex: 99
          });

        // set position
        var posCss = (o.position == 'right') ? { right: o.distance } : { left: o.distance };
        rail.css(posCss);
        bar.css(posCss);

        // wrap it
        me.wrap(wrapper);

        // append to parent div
        me.parent().append(bar);
        me.parent().append(rail);

        // make it draggable and no longer dependent on the jqueryUI
        if (o.railDraggable){
          bar.bind("mousedown", function(e) {
            var $doc = $(document);
            isDragg = true;
            t = parseFloat(bar.css('top'));
            pageY = e.pageY;

            $doc.bind("mousemove.slimscroll", function(e){
              currTop = t + e.pageY - pageY;
              bar.css('top', currTop);
              scrollContent(0, bar.position().top, false);// scroll content
            });

            $doc.bind("mouseup.slimscroll", function(e) {
              isDragg = false;hideBar();
              $doc.unbind('.slimscroll');
            });
            return false;
          }).bind("selectstart.slimscroll", function(e){
            e.stopPropagation();
            e.preventDefault();
            return false;
          });
        }

        // on rail over
        rail.hover(function(){
          showBar();
        }, function(){
          hideBar();
        });

        // on bar over
        bar.hover(function(){
          isOverBar = true;
        }, function(){
          isOverBar = false;
        });

        // show on parent mouseover
        me.hover(function(){
          isOverPanel = true;
          showBar();
          hideBar();
        }, function(){
          isOverPanel = false;
          hideBar();
        });

        // support for mobile
        me.bind('touchstart', function(e,b){
          if (e.originalEvent.touches.length)
          {
            // record where touch started
            touchDif = e.originalEvent.touches[0].pageY;
          }
        });

        me.bind('touchmove', function(e){
          // prevent scrolling the page if necessary
          if(!releaseScroll)
          {
            e.originalEvent.preventDefault();
          }
          if (e.originalEvent.touches.length)
          {
            // see how far user swiped
            var diff = (touchDif - e.originalEvent.touches[0].pageY) / o.touchScrollStep;
            // scroll content
            scrollContent(diff, true);
            touchDif = e.originalEvent.touches[0].pageY;
          }
        });

        // set up initial height
        getBarHeight();

        // check start position
        if (o.start === 'bottom')
        {
          // scroll content to bottom
          bar.css({ top: me.outerHeight() - bar.outerHeight() });
          scrollContent(0, true);
        }
        else if (o.start !== 'top')
        {
          // assume jQuery selector
          scrollContent($(o.start).position().top, null, true);

          // make sure bar stays hidden
          if (!o.alwaysVisible) { bar.hide(); }
        }

        // attach scroll events
        attachWheel(this);

        function _onWheel(e)
        {
          // use mouse wheel only when mouse is over
          if (!isOverPanel) { return; }

          var e = e || window.event;

          var delta = 0;
          if (e.wheelDelta) { delta = -e.wheelDelta/120; }
          if (e.detail) { delta = e.detail / 3; }

          var target = e.target || e.srcTarget || e.srcElement;
          if ($(target).closest('.' + o.wrapperClass).is(me.parent())) {
            // scroll content
            scrollContent(delta, true);
          }

          // stop window scroll
          if (e.preventDefault && !releaseScroll) { e.preventDefault(); }
          if (!releaseScroll) { e.returnValue = false; }
        }

        function scrollContent(y, isWheel, isJump)
        {
          releaseScroll = false;
          var delta = y;
          var maxTop = me.outerHeight() - bar.outerHeight();

          if (isWheel)
          {
            // move bar with mouse wheel
            delta = parseInt(bar.css('top')) + y * parseInt(o.wheelStep) / 100 * bar.outerHeight();

            // move bar, make sure it doesn't go out
            delta = Math.min(Math.max(delta, 0), maxTop);

            // if scrolling down, make sure a fractional change to the
            // scroll position isn't rounded away when the scrollbar's CSS is set
            // this flooring of delta would happened automatically when
            // bar.css is set below, but we floor here for clarity
            delta = (y > 0) ? Math.ceil(delta) : Math.floor(delta);

            // scroll the scrollbar
            bar.css({ top: delta + 'px' });
          }

          // calculate actual scroll amount
          percentScroll = parseInt(bar.css('top')) / (me.outerHeight() - bar.outerHeight());
          delta = percentScroll * (me[0].scrollHeight - me.outerHeight());

          if (isJump)
          {
            delta = y;
            var offsetTop = delta / me[0].scrollHeight * me.outerHeight();
            offsetTop = Math.min(Math.max(offsetTop, 0), maxTop);
            bar.css({ top: offsetTop + 'px' });
          }

          // scroll content
          me.scrollTop(delta);

          // fire scrolling event
          me.trigger('slimscrolling', ~~delta);

          // ensure bar is visible
          showBar();

          // trigger hide when scroll is stopped
          hideBar();
        }

        function attachWheel(target)
        {
          if (window.addEventListener)
          {
            target.addEventListener('DOMMouseScroll', _onWheel, false );
            target.addEventListener('mousewheel', _onWheel, false );
          }
          else
          {
            document.attachEvent("onmousewheel", _onWheel)
          }
        }

        function getBarHeight()
        {
          // calculate scrollbar height and make sure it is not too small
          barHeight = Math.max((me.outerHeight() / me[0].scrollHeight) * me.outerHeight(), minBarHeight);
          bar.css({ height: barHeight + 'px' });

          // hide scrollbar if content is not long enough
          var display = barHeight == me.outerHeight() ? 'none' : 'block';
          bar.css({ display: display });
        }

        function showBar()
        {
          // recalculate bar height
          getBarHeight();
          clearTimeout(queueHide);

          // when bar reached top or bottom
          if (percentScroll == ~~percentScroll)
          {
            //release wheel
            releaseScroll = o.allowPageScroll;

            // publish approporiate event
            if (lastScroll != percentScroll)
            {
              var msg = (~~percentScroll == 0) ? 'top' : 'bottom';
              me.trigger('slimscroll', msg);
            }
          }
          else
          {
            releaseScroll = false;
          }
          lastScroll = percentScroll;

          // show only when required
          if(barHeight >= me.outerHeight()) {
            //allow window scroll
            releaseScroll = true;
            return;
          }
          bar.stop(true,true).fadeIn('fast');
          if (o.railVisible) { rail.stop(true,true).fadeIn('fast'); }
        }

        function hideBar()
        {
          // only hide when options allow it
          if (!o.alwaysVisible)
          {
            queueHide = setTimeout(function(){
              if (!(o.disableFadeOut && isOverPanel) && !isOverBar && !isDragg)
              {
                bar.fadeOut('slow');
                rail.fadeOut('slow');
              }
            }, 1000);
          }
        }

      });

      // maintain chainability
      return this;
    }
  });

  $.fn.extend({
    slimscroll: $.fn.slimScroll
  });

})(jQuery);

/*! pace 0.5.1 */
(function() {
    var a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W = [].slice, X = {}.hasOwnProperty, Y = function(a, b) {
        function c() {
          this.constructor = a
        }
        for (var d in b)
          X.call(b, d) && (a[d] = b[d]);
        return c.prototype = b.prototype,
          a.prototype = new c,
          a.__super__ = b.prototype,
          a
      }, Z = [].indexOf || function(a) {
          for (var b = 0, c = this.length; c > b; b++)
            if (b in this && this[b] === a)
              return b;
          return -1
        }
    ;
    for (t = {
      catchupTime: 500,
      initialRate: .03,
      minTime: 500,
      ghostTime: 500,
      maxProgressPerFrame: 10,
      easeFactor: 1.25,
      startOnPageLoad: !0,
      restartOnPushState: !0,
      restartOnRequestAfter: 500,
      target: "body",
      elements: {
        checkInterval: 100,
        selectors: ["body"]
      },
      eventLag: {
        minSamples: 10,
        sampleCount: 3,
        lagThreshold: 3
      },
      ajax: {
        trackMethods: ["GET"],
        trackWebSockets: !0,
        ignoreURLs: []
      }
    },
           B = function() {
             var a;
             return null != (a = "undefined" != typeof performance && null !== performance ? "function" == typeof performance.now ? performance.now() : void 0 : void 0) ? a : +new Date
           }
           ,
           D = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
           s = window.cancelAnimationFrame || window.mozCancelAnimationFrame,
         null == D && (D = function(a) {
             return setTimeout(a, 50)
           }
             ,
             s = function(a) {
               return clearTimeout(a)
             }
         ),
           F = function(a) {
             var b, c;
             return b = B(),
               (c = function() {
                   var d;
                   return d = B() - b,
                     d >= 33 ? (b = B(),
                       a(d, function() {
                         return D(c)
                       })) : setTimeout(c, 33 - d)
                 }
               )()
           }
           ,
           E = function() {
             var a, b, c;
             return c = arguments[0],
               b = arguments[1],
               a = 3 <= arguments.length ? W.call(arguments, 2) : [],
               "function" == typeof c[b] ? c[b].apply(c, a) : c[b]
           }
           ,
           u = function() {
             var a, b, c, d, e, f, g;
             for (b = arguments[0],
                    d = 2 <= arguments.length ? W.call(arguments, 1) : [],
                    f = 0,
                    g = d.length; g > f; f++)
               if (c = d[f])
                 for (a in c)
                   X.call(c, a) && (e = c[a],
                     null != b[a] && "object" == typeof b[a] && null != e && "object" == typeof e ? u(b[a], e) : b[a] = e);
             return b
           }
           ,
           p = function(a) {
             var b, c, d, e, f;
             for (c = b = 0,
                    e = 0,
                    f = a.length; f > e; e++)
               d = a[e],
                 c += Math.abs(d),
                 b++;
             return c / b
           }
           ,
           w = function(a, b) {
             var c, d, e;
             if (null == a && (a = "options"),
               null == b && (b = !0),
                 e = document.querySelector("[data-pace-" + a + "]")) {
               if (c = e.getAttribute("data-pace-" + a),
                   !b)
                 return c;
               try {
                 return JSON.parse(c)
               } catch (f) {
                 return d = f,
                   "undefined" != typeof console && null !== console ? console.error("Error parsing inline pace options", d) : void 0
               }
             }
           }
           ,
           g = function() {
             function a() {}
             return a.prototype.on = function(a, b, c, d) {
               var e;
               return null == d && (d = !1),
               null == this.bindings && (this.bindings = {}),
               null == (e = this.bindings)[a] && (e[a] = []),
                 this.bindings[a].push({
                   handler: b,
                   ctx: c,
                   once: d
                 })
             }
               ,
               a.prototype.once = function(a, b, c) {
                 return this.on(a, b, c, !0)
               }
               ,
               a.prototype.off = function(a, b) {
                 var c, d, e;
                 if (null != (null != (d = this.bindings) ? d[a] : void 0)) {
                   if (null == b)
                     return delete this.bindings[a];
                   for (c = 0,
                          e = []; c < this.bindings[a].length; )
                     this.bindings[a][c].handler === b ? e.push(this.bindings[a].splice(c, 1)) : e.push(c++);
                   return e
                 }
               }
               ,
               a.prototype.trigger = function() {
                 var a, b, c, d, e, f, g, h, i;
                 if (c = arguments[0],
                     a = 2 <= arguments.length ? W.call(arguments, 1) : [],
                     null != (g = this.bindings) ? g[c] : void 0) {
                   for (e = 0,
                          i = []; e < this.bindings[c].length; )
                     h = this.bindings[c][e],
                       d = h.handler,
                       b = h.ctx,
                       f = h.once,
                       d.apply(null != b ? b : this, a),
                       f ? i.push(this.bindings[c].splice(e, 1)) : i.push(e++);
                   return i
                 }
               }
               ,
               a
           }(),
         null == window.Pace && (window.Pace = {}),
           u(Pace, g.prototype),
           C = Pace.options = u({}, t, window.paceOptions, w()),
           T = ["ajax", "document", "eventLag", "elements"],
           P = 0,
           R = T.length; R > P; P++)
      J = T[P],
      C[J] === !0 && (C[J] = t[J]);
    i = function(a) {
      function b() {
        return U = b.__super__.constructor.apply(this, arguments)
      }
      return Y(b, a),
        b
    }(Error),
      b = function() {
        function a() {
          this.progress = 0
        }
        return a.prototype.getElement = function() {
          var a;
          if (null == this.el) {
            if (a = document.querySelector(C.target),
                !a)
              throw new i;
            this.el = document.createElement("div"),
              this.el.className = "pace pace-active",
              document.body.className = document.body.className.replace(/pace-done/g, ""),
              document.body.className += " pace-running",
              this.el.innerHTML = '<div class="pace-progress">\n  <div class="pace-progress-inner"></div>\n</div>\n<div class="pace-activity"></div>',
              null != a.firstChild ? a.insertBefore(this.el, a.firstChild) : a.appendChild(this.el)
          }
          return this.el
        }
          ,
          a.prototype.finish = function() {
            var a;
            return a = this.getElement(),
              a.className = a.className.replace("pace-active", ""),
              a.className += " pace-inactive",
              document.body.className = document.body.className.replace("pace-running", ""),
              document.body.className += " pace-done"
          }
          ,
          a.prototype.update = function(a) {
            return this.progress = a,
              this.render()
          }
          ,
          a.prototype.destroy = function() {
            try {
              this.getElement().parentNode.removeChild(this.getElement())
            } catch (a) {
              i = a
            }
            return this.el = void 0
          }
          ,
          a.prototype.render = function() {
            var a, b;
            return null == document.querySelector(C.target) ? !1 : (a = this.getElement(),
              a.children[0].style.width = "" + this.progress + "%",
            (!this.lastRenderedProgress || this.lastRenderedProgress | 0 !== this.progress | 0) && (a.children[0].setAttribute("data-progress-text", "" + (0 | this.progress) + "%"),
              this.progress >= 100 ? b = "99" : (b = this.progress < 10 ? "0" : "",
                b += 0 | this.progress),
              a.children[0].setAttribute("data-progress", "" + b)),
              this.lastRenderedProgress = this.progress)
          }
          ,
          a.prototype.done = function() {
            return this.progress >= 100
          }
          ,
          a
      }(),
      h = function() {
        function a() {
          this.bindings = {}
        }
        return a.prototype.trigger = function(a, b) {
          var c, d, e, f, g;
          if (null != this.bindings[a]) {
            for (f = this.bindings[a],
                   g = [],
                   d = 0,
                   e = f.length; e > d; d++)
              c = f[d],
                g.push(c.call(this, b));
            return g
          }
        }
          ,
          a.prototype.on = function(a, b) {
            var c;
            return null == (c = this.bindings)[a] && (c[a] = []),
              this.bindings[a].push(b)
          }
          ,
          a
      }(),
      O = window.XMLHttpRequest,
      N = window.XDomainRequest,
      M = window.WebSocket,
      v = function(a, b) {
        var c, d, e, f;
        f = [];
        for (d in b.prototype)
          try {
            e = b.prototype[d],
              null == a[d] && "function" != typeof e ? f.push(a[d] = e) : f.push(void 0)
          } catch (g) {
            c = g
          }
        return f
      }
      ,
      z = [],
      Pace.ignore = function() {
        var a, b, c;
        return b = arguments[0],
          a = 2 <= arguments.length ? W.call(arguments, 1) : [],
          z.unshift("ignore"),
          c = b.apply(null, a),
          z.shift(),
          c
      }
      ,
      Pace.track = function() {
        var a, b, c;
        return b = arguments[0],
          a = 2 <= arguments.length ? W.call(arguments, 1) : [],
          z.unshift("track"),
          c = b.apply(null, a),
          z.shift(),
          c
      }
      ,
      I = function(a) {
        var b;
        if (null == a && (a = "GET"),
          "track" === z[0])
          return "force";
        if (!z.length && C.ajax) {
          if ("socket" === a && C.ajax.trackWebSockets)
            return !0;
          if (b = a.toUpperCase(),
            Z.call(C.ajax.trackMethods, b) >= 0)
            return !0
        }
        return !1
      }
      ,
      j = function(a) {
        function b() {
          var a, c = this;
          b.__super__.constructor.apply(this, arguments),
            a = function(a) {
              var b;
              return b = a.open,
                a.open = function(d, e) {
                  return I(d) && c.trigger("request", {
                    type: d,
                    url: e,
                    request: a
                  }),
                    b.apply(a, arguments)
                }
            }
            ,
            window.XMLHttpRequest = function(b) {
              var c;
              return c = new O(b),
                a(c),
                c
            }
            ,
            v(window.XMLHttpRequest, O),
          null != N && (window.XDomainRequest = function() {
            var b;
            return b = new N,
              a(b),
              b
          }
            ,
            v(window.XDomainRequest, N)),
          null != M && C.ajax.trackWebSockets && (window.WebSocket = function(a, b) {
            var d;
            return d = null != b ? new M(a,b) : new M(a),
            I("socket") && c.trigger("request", {
              type: "socket",
              url: a,
              protocols: b,
              request: d
            }),
              d
          }
            ,
            v(window.WebSocket, M))
        }
        return Y(b, a),
          b
      }(h),
      Q = null,
      x = function() {
        return null == Q && (Q = new j),
          Q
      }
      ,
      H = function(a) {
        var b, c, d, e;
        for (e = C.ajax.ignoreURLs,
               c = 0,
               d = e.length; d > c; c++)
          if (b = e[c],
            "string" == typeof b) {
            if (-1 !== a.indexOf(b))
              return !0
          } else if (b.test(a))
            return !0;
        return !1
      }
      ,
      x().on("request", function(b) {
        var c, d, e, f, g;
        return f = b.type,
          e = b.request,
          g = b.url,
          H(g) ? void 0 : Pace.running || C.restartOnRequestAfter === !1 && "force" !== I(f) ? void 0 : (d = arguments,
            c = C.restartOnRequestAfter || 0,
          "boolean" == typeof c && (c = 0),
            setTimeout(function() {
              var b, c, g, h, i, j;
              if (b = "socket" === f ? e.readyState < 2 : 0 < (h = e.readyState) && 4 > h) {
                for (Pace.restart(),
                       i = Pace.sources,
                       j = [],
                       c = 0,
                       g = i.length; g > c; c++) {
                  if (J = i[c],
                    J instanceof a) {
                    J.watch.apply(J, d);
                    break
                  }
                  j.push(void 0)
                }
                return j
              }
            }, c))
      }),
      a = function() {
        function a() {
          var a = this;
          this.elements = [],
            x().on("request", function() {
              return a.watch.apply(a, arguments)
            })
        }
        return a.prototype.watch = function(a) {
          var b, c, d, e;
          return d = a.type,
            b = a.request,
            e = a.url,
            H(e) ? void 0 : (c = "socket" === d ? new m(b) : new n(b),
              this.elements.push(c))
        }
          ,
          a
      }(),
      n = function() {
        function a(a) {
          var b, c, d, e, f, g, h = this;
          if (this.progress = 0,
            null != window.ProgressEvent)
            for (c = null,
                   a.addEventListener("progress", function(a) {
                     return h.progress = a.lengthComputable ? 100 * a.loaded / a.total : h.progress + (100 - h.progress) / 2
                   }),
                   g = ["load", "abort", "timeout", "error"],
                   d = 0,
                   e = g.length; e > d; d++)
              b = g[d],
                a.addEventListener(b, function() {
                  return h.progress = 100
                });
          else
            f = a.onreadystatechange,
              a.onreadystatechange = function() {
                var b;
                return 0 === (b = a.readyState) || 4 === b ? h.progress = 100 : 3 === a.readyState && (h.progress = 50),
                  "function" == typeof f ? f.apply(null, arguments) : void 0
              }
        }
        return a
      }(),
      m = function() {
        function a(a) {
          var b, c, d, e, f = this;
          for (this.progress = 0,
                 e = ["error", "open"],
                 c = 0,
                 d = e.length; d > c; c++)
            b = e[c],
              a.addEventListener(b, function() {
                return f.progress = 100
              })
        }
        return a
      }(),
      d = function() {
        function a(a) {
          var b, c, d, f;
          for (null == a && (a = {}),
                 this.elements = [],
               null == a.selectors && (a.selectors = []),
                 f = a.selectors,
                 c = 0,
                 d = f.length; d > c; c++)
            b = f[c],
              this.elements.push(new e(b))
        }
        return a
      }(),
      e = function() {
        function a(a) {
          this.selector = a,
            this.progress = 0,
            this.check()
        }
        return a.prototype.check = function() {
          var a = this;
          return document.querySelector(this.selector) ? this.done() : setTimeout(function() {
            return a.check()
          }, C.elements.checkInterval)
        }
          ,
          a.prototype.done = function() {
            return this.progress = 100
          }
          ,
          a
      }(),
      c = function() {
        function a() {
          var a, b, c = this;
          this.progress = null != (b = this.states[document.readyState]) ? b : 100,
            a = document.onreadystatechange,
            document.onreadystatechange = function() {
              return null != c.states[document.readyState] && (c.progress = c.states[document.readyState]),
                "function" == typeof a ? a.apply(null, arguments) : void 0
            }
        }
        return a.prototype.states = {
          loading: 0,
          interactive: 50,
          complete: 100
        },
          a
      }(),
      f = function() {
        function a() {
          var a, b, c, d, e, f = this;
          this.progress = 0,
            a = 0,
            e = [],
            d = 0,
            c = B(),
            b = setInterval(function() {
              var g;
              return g = B() - c - 50,
                c = B(),
                e.push(g),
              e.length > C.eventLag.sampleCount && e.shift(),
                a = p(e),
                ++d >= C.eventLag.minSamples && a < C.eventLag.lagThreshold ? (f.progress = 100,
                  clearInterval(b)) : f.progress = 100 * (3 / (a + 3))
            }, 50)
        }
        return a
      }(),
      l = function() {
        function a(a) {
          this.source = a,
            this.last = this.sinceLastUpdate = 0,
            this.rate = C.initialRate,
            this.catchup = 0,
            this.progress = this.lastProgress = 0,
          null != this.source && (this.progress = E(this.source, "progress"))
        }
        return a.prototype.tick = function(a, b) {
          var c;
          return null == b && (b = E(this.source, "progress")),
          b >= 100 && (this.done = !0),
            b === this.last ? this.sinceLastUpdate += a : (this.sinceLastUpdate && (this.rate = (b - this.last) / this.sinceLastUpdate),
              this.catchup = (b - this.progress) / C.catchupTime,
              this.sinceLastUpdate = 0,
              this.last = b),
          b > this.progress && (this.progress += this.catchup * a),
            c = 1 - Math.pow(this.progress / 100, C.easeFactor),
            this.progress += c * this.rate * a,
            this.progress = Math.min(this.lastProgress + C.maxProgressPerFrame, this.progress),
            this.progress = Math.max(0, this.progress),
            this.progress = Math.min(100, this.progress),
            this.lastProgress = this.progress,
            this.progress
        }
          ,
          a
      }(),
      K = null,
      G = null,
      q = null,
      L = null,
      o = null,
      r = null,
      Pace.running = !1,
      y = function() {
        return C.restartOnPushState ? Pace.restart() : void 0
      }
      ,
    null != window.history.pushState && (S = window.history.pushState,
        window.history.pushState = function() {
          return y(),
            S.apply(window.history, arguments)
        }
    ),
    null != window.history.replaceState && (V = window.history.replaceState,
        window.history.replaceState = function() {
          return y(),
            V.apply(window.history, arguments)
        }
    ),
      k = {
        ajax: a,
        elements: d,
        document: c,
        eventLag: f
      },
      (A = function() {
          var a, c, d, e, f, g, h, i;
          for (Pace.sources = K = [],
                 g = ["ajax", "elements", "document", "eventLag"],
                 c = 0,
                 e = g.length; e > c; c++)
            a = g[c],
            C[a] !== !1 && K.push(new k[a](C[a]));
          for (i = null != (h = C.extraSources) ? h : [],
                 d = 0,
                 f = i.length; f > d; d++)
            J = i[d],
              K.push(new J(C));
          return Pace.bar = q = new b,
            G = [],
            L = new l
        }
      )(),
      Pace.stop = function() {
        return Pace.trigger("stop"),
          Pace.running = !1,
          q.destroy(),
          r = !0,
        null != o && ("function" == typeof s && s(o),
          o = null),
          A()
      }
      ,
      Pace.restart = function() {
        return Pace.trigger("restart"),
          Pace.stop(),
          Pace.start()
      }
      ,
      Pace.go = function() {
        var a;
        return Pace.running = !0,
          q.render(),
          a = B(),
          r = !1,
          o = F(function(b, c) {
            var d, e, f, g, h, i, j, k, m, n, o, p, s, t, u, v;
            for (k = 100 - q.progress,
                   e = o = 0,
                   f = !0,
                   i = p = 0,
                   t = K.length; t > p; i = ++p)
              for (J = K[i],
                     n = null != G[i] ? G[i] : G[i] = [],
                     h = null != (v = J.elements) ? v : [J],
                     j = s = 0,
                     u = h.length; u > s; j = ++s)
                g = h[j],
                  m = null != n[j] ? n[j] : n[j] = new l(g),
                  f &= m.done,
                m.done || (e++,
                  o += m.tick(b));
            return d = o / e,
              q.update(L.tick(b, d)),
              q.done() || f || r ? (q.update(100),
                Pace.trigger("done"),
                setTimeout(function() {
                  return q.finish(),
                    Pace.running = !1,
                    Pace.trigger("hide")
                }, Math.max(C.ghostTime, Math.max(C.minTime - (B() - a), 0)))) : c()
          })
      }
      ,
      Pace.start = function(a) {
        u(C, a),
          Pace.running = !0;
        try {
          q.render()
        } catch (b) {
          i = b
        }
        return document.querySelector(".pace") ? (Pace.trigger("start"),
          Pace.go()) : setTimeout(Pace.start, 50)
      }
      ,
      "function" == typeof define && define.amd ? define(function() {
        return Pace
      }) : "object" == typeof exports ? module.exports = Pace : C.startOnPageLoad && Pace.start()
  }
).call(this);
