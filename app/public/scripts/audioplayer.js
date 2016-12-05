/**
 * Created by Administrator on 2016/10/13 0013.
 */
var audioPlayer = {
  loadVoice: function (url) {
    var s = '<audio id="audio" src="' +
      url +
      '">亲 您的浏览器不支持html5的audio标签</audio>';
    $('.voice').append(s);
    var control = $('#control');
    var userAgent = navigator.userAgent.toLowerCase();
    var isSafari = userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') < 1 ;
    if(isSafari){
      $(control).addClass('pause');
    }else {
      $(control).addClass('play');
    }
    this.playCotrol();
    var audio = document.getElementById('audio');
    if ($(control).hasClass('play')) {
      audio.load(); //ios9
      audio.play();
    }
    this.clicks();
    /*
    *   chrome(模拟器iphone): mozilla/5.0 (iphone; cpu iphone os 9_1 like mac os x) applewebkit/601.1.46 (khtml, like gecko)
    *                         version/9.0 mobile/13b143 safari/601.1
    *
    *   safari:               mozilla/5.0 (iphone; cpu iphone os 10_1_1 like mac os x) applewebkit/602.2.14 (khtml, like gecko)
    *                         version/10.0 mobile/14b100 safari/602.1
    *
    *   chrome:               mozilla/5.0 (windows nt 10.0; wow64) applewebkit/537.36 (khtml, like gecko)
    *                         chrome/54.0.2840.87 safari/537.36
    *
    *  */
  },
  clicks: function () {
    var audio = document.getElementById('audio');
    $('#control').click(function() {
      if ($('#control').hasClass('play')) {
        audio.pause();
      } else {
        audio.play();
      }
    })
  },
  playCotrol: function () {
    var audio = document.getElementById('audio');
    audio.addEventListener('loadstart', function() {
      console.log('loadstart');
    }, false);
    audio.addEventListener('loadeddata',
      function() {
        console.log('loadeddata');
      }, false);
    audio.addEventListener('loadedmetadata', function() {
      console.log('loadedmetadata');
    }, false);
    audio.addEventListener('canplay', function() {
      console.log('canplay');
    }, false);
    audio.addEventListener('error',
      function() {
        console.log('error');
      }, false);
    audio.addEventListener('pause',
      function() {
        $('#control').addClass('pause').removeClass('play');
      }, false);
    audio.addEventListener('play',
      function() {
        $('#control').addClass('play').removeClass('pause');
      }, false);
  }
};
