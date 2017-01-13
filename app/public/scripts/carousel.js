+function ($) {
  'use strict';
  function transitionEnd() {
    var el = document.createElement('wei');
    var transEndEventNames = {
      WebkitTransition: 'webkitTransitionEnd',
      MozTransition: 'transitionend',
      OTransition: 'oTransitionEnd otransitionend',
      transition: 'transitionend'
    };
    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return {end: transEndEventNames[name]}
      }
    }
    return false;
  }

  $.fn.emulateTransitionEnd = function (duration) {
    var called = false;
    var $el = this;
    $(this).one('bsTransitionEnd', function () {
      called = true
    });
    var callback = function () {
      if (!called) $($el).trigger($.support.transition.end)
    };
    setTimeout(callback, duration);
    return this;
  };
  $(function () {
    $.support.transition = transitionEnd();
    if (!$.support.transition) return;
    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })
}(jQuery);
;(function ($, window, document, hammer) {
  //构造
  var carousel = function (element, options) {
    this.defaults = {
      interval: 2000,
      pause: 'hover',
      wrap: true,        //若设置为false，所有item只轮播一遍，不循环
      data: [],     //默认图片
      hasCtrls: true,        //默认有左右箭头
      hasBtns: true,         //默认有小点
      txt_data: '',
      height: 'auto'            //carousel高度: 1.'auto':默认自动; 2.'width':与元素宽度一样; 3.自定义数值
    };

    var opts = $.extend({}, this.defaults, options);     //将$.fn.carousel.defaults和options合并放入第一个参数“{}”中
    this.$element = $(element);
    this.options = opts;
    this.paused = null;
    this.sliding = null;
    this.interval = null;
    this.$active = null;
    this.$items = null;
    this.txt_data = opts.txt_data;
    this.img = this.options.data;
    this.ctrls = this.options.hasCtrls;
    this.btns = this.options.hasBtns;
    var video_num = 0;
    video_num = addHtml.call(this.$element, this.img, this.ctrls, this.btns, this.txt_data);

    $('.js-video').on('click', {obj: this.img}, function (e) {
      loadVideo($(this), $(e.data.obj), video_num);
    });

/*    var _imgs = this.img;
    var ham_video = new hammer($('.js-video')[0]);
    ham_video.on($('.js-video').get[0] ,'tap', function (e) {
      loadVideo($(this), $(_imgs), video_num);
    });*/



    if(this.options.height == 'width'){
      this.$element.height(this.$element.width());
    }
    else if(this.options.height != 'auto'){
      this.$element.height(this.options.height);
    }
    if($('video.items-img').length > 0){
      $('video.items-img').height(this.$element.width());
    }


    this.$indicators = this.$element.find('.wei-carousel-btns');
    var left_ctrl = this.$element.find('.ctrls-a-l'), right_ctrl = this.$element.find('.ctrls-a-r');
    this.$items = this.$indicators.find('li');
    $(left_ctrl).on('click', $.proxy(this.prev, this));
    $(right_ctrl).on('click', $.proxy(this.next, this));
    $(this.$items).on('click', {obj: this.$element}, clickHandler);
    //触摸支持
    var ham = new hammer((this.$element)[0]);
    ham.on('panleft', $.proxy(this.next, this));
    ham.on('panright', $.proxy(this.prev, this));

    return this;
  };

  function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ['Android', 'iPhone',
      'SymbianOS', 'Windows Phone',
      'iPad', 'iPod'];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }
    return flag;
  }
  function loadVideo(obj, data, i) {
    var p = $(obj).parents('.items-container');
    var items = '<div class="items-a">' +
      '<video class="items-img" ' +
      '" controls="controls" preload="metadata" ' +
      'src="' +
      data[i].url +
      '"' +
      'poster="' +
      data[i].poster +
      '"></video>' +
      '</div>';

    $(p).append(items);
    var js_video = $('.js-video');
    var _video = $('video.items-img').get(0);

    _video.play();

    $(_video).on('playing', function() {
      // 开始播放
      if($(_video).hasClass('small')){
        $(_video).removeClass('small');
      }
      $(js_video).hide();
    });

   /* $(_video).on('play', function() {
      // 开始播放
      if($(_video).hasClass('small')){
        $(_video).removeClass('small');
      }
      $(js_video).hide();
      _video.play();
    });*/

    $(_video).on('pause', function() {
      // 暂停播放时
      _video.pause();
      $(js_video).show();
      $(_video).addClass('small');

    });


    // $("video.items-img").trigger("play");
  }
  function stopVideo() {
    var _obj = $('.js-video');
    $(_obj).show();
    var p = $(_obj).parents('.items-container');
    $(p).find('div.items-a').remove();
    // $('video.items-img').get(0).pause();
  }
  function addHtml(data, hasCtrls, hasBtns, txt) {
    var video_num = 0;
    var ctrls = '<div class="wei-carousel-ctrls">' +
        '<a href="javascript:;" class="ctrls-a-l"><span class="ctrls-l"></span></a>' +
        '<a href="javascript:;" class="ctrls-a-r"><span class="ctrls-r"></span></a>' +
        '</div>',
      items = '<div class="wei-carousel-items">',
      btns = '<ol class="wei-carousel-btns">',
      content = '',
      captions = '';
    if(txt.length != 0)captions = '<div class="wei-carousel-captions">' + txt[0] + '</div>';
    if (hasCtrls)content += ctrls;
    if (!data || data.length <= 0)return false;
    $.each(data, function (i) {
      items += '<div class="items-container">';
      // var _data = [],str = '';
      if(typeof (data[i]) === 'string'){
        //为图片
        // _data = data[i].split('.');
        // str = _data[_data.length - 1].toLowerCase();
      /*}
      if(str != 'jpg' && str != 'jpeg' && str != 'png' && str != 'bmp' && str != 'gif'){*/
        items += '<a href="javascript:;" class="items-a">' +
          '<img src="' +
          data[i] +
          '" class="items-img"/>' +
          '</a>';
      }

      else{
        //为视频
        video_num = i;
        items += '<a href="javascript:;" class="items-a cal-video js-video">' +
          '<img src="' +
          data[i].poster +
          '" class="items-img"/>' +
          '<img src="' +
          data[i].play +
          '" class="items-img play"/>' +

         /* '<video class="items-img" ' +
          '" controls="controls" preload="metadata" ' +
          'src="' +
          data[i].url +
          '"' +
          'poster="' +
          data[i].poster +
          '"></video>' +*/
          '</a>';
      }
      items += '</div>';
      btns += '<li></li>';

    });
    items += '</div>';
    btns += '</ol>';
    if(hasBtns)content += (items + btns);
    else {
      content += items;
    }
    content += captions;

    this.html(content);
    this.find('.items-container').eq(0).addClass('active');
    this.find('.wei-carousel-btns li:first-child').addClass('active');

    return video_num;
  }

  function plugin(opts) {
    return this.each(function () {
      var data = $(this).data('wei.carousel');
      var options = $.extend({}, $(this).data(), typeof opts == 'object' && opts);
      if (!data) $(this).data('wei.carousel', (data = new carousel(this, options)));
      if (options.interval) data.pause().cycle();
    });
  }

  //入口
  $.fn.carousel = plugin;

  var clickHandler = function (e) {
    var $target = $(e.data.obj);
    // var options = $.extend({}, $target.data(), $(this).data());
    var options = $target.data();

    var slideIndex = $(this).index();
    if (slideIndex >= 0) options.interval = false;

    plugin.call($target, options);
    if (slideIndex >= 0) {
      $target.data('wei.carousel').to(slideIndex);
    }
    e.preventDefault()
  };

  carousel.prototype = {
    slide: function (type, next) {
      var $active = this.$element.find('.items-container.active');
      var $next = next || this.getItemForDirection(type, $active);
      var isCycling = this.interval;
      var direction = type == 'next' ? 'left' : 'right';
      var that = this;
      if ($next.hasClass('active')) return (this.sliding = false);
      var relatedTarget = $next[0];
      var slideEvent = $.Event('slide.wei.carousel', {
        relatedTarget: relatedTarget,
        direction: direction
      });
      this.$element.trigger(slideEvent);
      if (slideEvent.isDefaultPrevented()) return;
      this.sliding = true;
      isCycling && this.pause();
      if (this.$indicators.length) {
        this.$indicators.find('.active').removeClass('active');
        var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)]);
        $nextIndicator && $nextIndicator.addClass('active');
      }
      var slidEvent = $.Event('slid.wei.carousel', {relatedTarget: relatedTarget, direction: direction}); // yes, "slid"

      $next.addClass(type);
      $next[0].offsetWidth; // force reflow
      $active.addClass(direction);
      $next.addClass(direction);
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active');
          $active.removeClass(['active', direction].join(' '));
          that.sliding = false;
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0);
        })
        .emulateTransitionEnd(600);
      isCycling && this.cycle();

      var index= this.getItemIndex($active);
      if($('.wei-carousel-captions').length > 0 && this.txt_data.length != 0){
        if(direction == 'left'){
          if(index >= this.$items.length -1 )index = -1;
          $('.wei-carousel-captions').html(this.txt_data[index + 1]);
        }
        else {
          if(index <= 0 )index = this.$items.length;
          $('.wei-carousel-captions').html(this.txt_data[index - 1]);
        }

      }
      stopVideo();

      return this;
    },
    getItemIndex: function (item) {
      this.$items = item.parent().children('.items-container');
      return this.$items.index(item || this.$active);
    },
    getItemForDirection: function (direction, active) {
      var activeIndex = this.getItemIndex(active);

      var willWrap = (direction == 'prev' && activeIndex === 0)
        || (direction == 'next' && activeIndex == (this.$items.length - 1));
      /*
       * (direction == 'prev' && activeIndex === 0):active为第一个时，向前滑动
       * (direction == 'next' && activeIndex == (this.$items.length - 1))：active为最后一个时，向后继续滑动
       * */
      if (willWrap && !this.options.wrap) return active;
      /*
       *   如果willWrap == true , this.options.wrap == false(只轮播一遍，不循环), 则 return active
       *
       * */

      var delta = direction == 'prev' ? -1 : 1;
      var itemIndex = (activeIndex + delta) % this.$items.length;
      return this.$items.eq(itemIndex);
    },
    cycle: function (e) {
      e || (this.paused = false);   //若e = undefined (即不传值)，则执行(this.paused = false)；若 e = true，则不执行(this.paused = false)
      this.interval && clearInterval(this.interval);
      this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval));
      return this;
    },
    next: function () {
      if (this.sliding) return;
      return this.slide('next');
    },
    prev: function () {
      if (this.sliding) return;
      return this.slide('prev');
    },
    to: function (pos) {
      var that = this;
      this.$active = this.$element.find('.items-container.active');
      var activeIndex = this.getItemIndex(this.$active);
      if (pos > (this.$items.length - 1) || pos < 0) return;
      if (this.sliding)       return this.$element.one('slid.wei.carousel', function () {
        that.to(pos);
      }); // yes, "slid"
      if (activeIndex == pos) return this.pause().cycle();
      return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos));
    },
    pause: function (e) {
      e || (this.paused = true);
      if (this.$element.find('.next, .prev').length && $.support.transition) {
        this.$element.trigger($.support.transition.end);
        this.cycle(true);
      }
      this.interval = clearInterval(this.interval);
      return this;
    }
  };
  // 定义私有函数
  function priFunc() {
    console.log('priFunc');
  }

  // 定义暴露函数
  $.fn.carousel.pubFunc = function () {
    console.log('pubFunc')
  };
})(jQuery, window, document, Hammer);
;(function($, hammer){
  $.fn.carousel_h = function(opt){
    var
      o = $.extend({
        startIndex: 0,
        li: 'li',
        visibleCount: 6,
        step:0.5,
        rotateY:0,
        translateZ:100,
        preventTouchEvent:false,
        style:'double',
        resizeEvent: false,
        speed: 2000
      }, opt);
    return $(this).each(function () {
      var
        $this = $(this),
        $carousel = $this,
        $lis = $(o.li, $this),
        lisHeight = $lis.height(),
        lisLength = $lis.length,
        curIndex = o.startIndex,
        width = $carousel.width(),
        speed = o.speed,
        visibleCount = o.visibleCount;
      if (visibleCount > lisLength)
      {
        visibleCount = lisLength;
      }
      function fixIndex(index) {
        return (index + lisLength) % lisLength;
      }
      function translate(index) {
        var
          len = visibleCount / 2,
          i = 1,
          li_index,
          leftIndex = 0,
          rightIndex = 0;
        index = fixIndex(index);
        $lis.removeClass('js-carousel-li-visible').eq(index).addClass('js-carousel-li-visible js-carousel-li-cur')
          .css({
            '-webkit-transform': 'none',
            'z-index': 1000
          });
        if (o.style === 'double') {
          for(i; i <= len; i++) {
            leftIndex = fixIndex(index - i);
            rightIndex = fixIndex(index + i);
            $lis.eq(leftIndex).addClass('js-carousel-li-visible').css({
              'z-index': 1000 - i,
              '-webkit-transform': 'translateX(' + (-o.step * width * i) + 'px) translateZ(-' + o.translateZ * i + 'px)  rotateY(' + o.rotateY + 'deg)'
            });
            $lis.eq(rightIndex).addClass('js-carousel-li-visible').css({
              'z-index': 1000 - i,
              '-webkit-transform': 'translateX(' + (o.step * width * i) + 'px) translateZ(-' + o.translateZ * i + 'px) rotateY(-' + o.rotateY + 'deg)'
            });
          }
        } else if (o.style === 'left') {
          len = visibleCount;
          for(i; i < len; i++) {
            rightIndex = fixIndex(index + i);
            $lis.eq(rightIndex).addClass('js-carousel-li-visible').css({
              'z-index': 1000 - i,
              '-webkit-transform': 'translateX(' + (o.step * width * i) + 'px) translateZ(-' + o.translateZ * i + 'px) rotateY(-' + o.rotateY + 'deg)'
            });
          }
        } else if (o.style === 'right') {
          len = visibleCount;
          for(i; i < len; i++) {
            leftIndex = fixIndex(index - i);
            $lis.eq(leftIndex).addClass('js-carousel-li-visible').css({
              'z-index': 1000 - i,
              '-webkit-transform': 'translateX(' + (-o.step * width * i) + 'px) translateZ(-' + o.translateZ * i + 'px) rotateY(' + o.rotateY + 'deg)'
            });
          }
        }
        /* 椭圆形 */
        else if (o.style === 'circle') {
          var r = (width/2) / Math.tan(30 / 180 * Math.PI);
          var position = [
            {
              x: -70, y: 50, z: 0
            },
            {
              x: 70, y: 50, z: 0
            },
            {
              x: 140, y: 35, z: -100
            },
            {
              x: 70, y: 20, z: -150
            },
            {
              x: -70, y: 20, z: -150
            },
            {
              x: -140, y: 35, z: -100
            }
          ];
          var m = 0;
          for(var j = 1; j <= visibleCount; j++) {
            li_index = fixIndex(index - j);
            if(parseInt(position[position.length - j].y) == 20){
              m = -1;
            }else {
              m = 2;
            }
            $lis.eq(li_index).addClass('js-carousel-li-visible').css({
              'z-index': m,
              '-webkit-transform': 'translateX(' + (position[position.length-j].x) + 'px) translateY(' + (position[position.length-j].y) + 'px) translateZ(' + (position[position.length-j].z) + 'px)  rotateY(' + o.rotateY + 'deg)'
            });
          }
        }
        curIndex = index;
      }
      function updateSize() {
        width = $carousel.width();
        translate(curIndex);
        lisHeight = $lis.filter('.js-carousel-li-cur').height();
        if(o.style !== 'circle') {
          $carousel.height(lisHeight);
        }
      }
      function init() {
        $lis.addClass('js-carousel-li');

        if(o.style !== 'circle'){
          var ham = new hammer($carousel[0]);
          ham.on('swipeleft', function () {
            translate(curIndex + 1);
          });
          ham.on('swiperight', function () {
            translate(curIndex - 1);
          });
        }

        if(o.style === 'circle'){
          var ti = setInterval(function () {
            translate(curIndex + 1);
          }, speed);
        }


        //绑定事件
        /*				$carousel.swipeLeft(function (e) {
         translate(curIndex + 1);
         });
         $carousel.swipeRight(function (e) {
         translate(curIndex - 1);
         });*/
        $(document).ready(function (e) {
          updateSize();
        });
        if (o.resizeEvent) {
          $(window).on('resize', function (e) {
            updateSize();
          });
        }
        if (o.preventTouchEvent) {
          $carousel.on('touchstart', function (e) {
            e.preventDefault();
          });
          $carousel.on('touchmove', function (e) {
            e.preventDefault();
          });
        }
      }
      init();
    });
  };
}(jQuery, Hammer));
