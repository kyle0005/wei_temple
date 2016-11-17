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
    if ($('#control').hasClass('play')) {
      audio.play();//开始播放
    }

  },
  clicks: function (url) {
    var audio = '';
    $('#control').click(function() {
      if ($('#control').hasClass('play')) {
        audioPlayer.loadVoice(url);
        audioPlayer.playCotrol();
        audio = document.getElementById('audio');
        audio.play();//开始播放
      } else {
        audio.pause();
      }
    })
  },
  playCotrol: function () {
    var audio = document.getElementById('audio');
    audio.addEventListener('loadeddata', //歌曲一经完整的加载完毕
      function() {
        // audioPlayer.clicks();
      }, false);
    audio.addEventListener('pause',
      function() { //监听暂停
        $('#control').addClass('play').removeClass('pause');
      }, false);
    audio.addEventListener('play',
      function() { //监听播放
        $('#control').addClass('pause').removeClass('play');
      }, false);
  }
};
