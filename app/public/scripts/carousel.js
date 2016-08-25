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
      data: ['2.jpg'],     //默认图片
      hasCtrls: true,        //默认有左右箭头
      hasBtns: true,         //默认有小点
      txt_data: ''
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
    addHtml.call(this.$element, this.img, this.ctrls, this.btns, this.txt_data);

    this.$indicators = this.$element.find('.wei-carousel-btns');
    // this.$captions = this.$element.find('.wei-carousel-captions');
    // this.$captionCons = this.$captions.find('.caption-container');
/*    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.wei.carousel', $.proxy(this.pause, this))
      .on('mouseleave.wei.carousel', $.proxy(this.cycle, this));*/
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

  function addHtml(data, hasCtrls, hasBtns, txt) {
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
      items += '<div class="items-container">' +
        '<a href="javascript:;" class="items-a">' +
        '<img src="' +
        data[i] +
        '" class="items-img"/>' +
        '</a>' +
        '</div>';
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
