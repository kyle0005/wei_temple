/**
 * Created by Administrator on 2016/10/13 0013.
 */
var audioPlayer = {
  loadVoice: function (url) {
    var s = '<audio id="audio" src="' +
      url +
      '">亲 您的浏览器不支持html5的audio标签</audio>';
    $('.voice').append(s);

    this.playCotrol(); //播放控制函数

    var userAgent = navigator.userAgent.toLowerCase(); //取得浏览器的userAgent字符串
    if (userAgent.match(/MicroMessenger/i) == "micromessenger") {

    } else {
      $('#control').addClass('pause').removeClass('play');
    }

    var audio = document.getElementById('audio');
    if ($('#control').hasClass('play')) {
      audio.load(); //ios9
      audio.play();//开始播放
    }



/*    var audio = document.getElementById('audio');
    $(window).one('touchstart click',function(){
      audio.load(); //ios9
      audio.play();
    });*/

  },
  clicks: function () {
    var audio = document.getElementById('audio');
    $('#control').click(function() {
      if ($('#control').hasClass('play')) {
        audio.pause();
      } else {
        alert('click');
        audio.play();//开始播放
      }
    })
  },
  playCotrol: function () {
    var audio = document.getElementById('audio');
    audio.addEventListener('loadeddata', //歌曲一经完整的加载完毕
      function() {
        audioPlayer.clicks();
      }, false);
    audio.addEventListener('error', //歌曲一经完整的加载完毕
      function() {
      }, false);
    audio.addEventListener('pause',
      function() { //监听暂停
        $('#control').addClass('pause').removeClass('play');
      }, false);
    audio.addEventListener('play',
      function() { //监听播放
        $('#control').addClass('play').removeClass('pause');
      }, false);
  }
};




  /*function loadVoice(url) {
    var s = '<audio id="audio" src="' +
      url +
      '">亲 您的浏览器不支持html5的audio标签</audio>';
    $('.voice').append(s);
    playCotrol(); //播放控制函数
  }

  //点击播放/暂停
  function clicks() {
    var audio = document.getElementById("audio");
    $("#control").click(function() {
      if ($("#control").hasClass("play")) {
        $("#control").addClass("pause").removeClass("play");
        audio.play();//开始播放
      } else {
        $("#control").addClass("play").removeClass("pause");
        audio.pause();
      }
    })
  }
  //播放事件监听
  function playCotrol() {
    var audio = document.getElementById("audio");
    audio.addEventListener("loadeddata", //歌曲一经完整的加载完毕
      function() {
        clicks();
      }, false);
    audio.addEventListener("pause",
      function() { //监听暂停
        $("#control").addClass("play").removeClass("pause");
      }, false);
    audio.addEventListener("play",
      function() { //监听播放
        $("#control").addClass("pause").removeClass("play");
      }, false);
  }*/


