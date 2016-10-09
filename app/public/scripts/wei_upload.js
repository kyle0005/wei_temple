;(function ($, window, document, undefined) {
    var uploads = function (ele, opt) {
        this.$element = ele;
            this.defaults = {
              'input_id': '',
              'c_url': '',
              'extensions': '',
              'number': 0,
              'singleRepeat':false,
              'text':false,
              'text_name':'',
              'text_placeholder':''
            };
            this.options = $.extend({}, this.defaults, opt);
    };
    uploads.prototype = {
      init: function () {
        var input_id = this.options.input_id;
        var c_url = this.options.c_url;
        var extensions = this.options.extensions;
        var number = this.options.number;
        var singleRepeat = this.options.singleRepeat;
        var _extensions = extensions || "jpg,jpeg,gif,png";
        var text = this.options.text;
        var text_name = this.options.text_name;
        var text_placeholder = this.options.text_placeholder;

        var $this = this.$element;
        $this.children('.upload-inp').on('change', function () {
          if($(this).val()!=''){
            var formData = new FormData();
            formData.append("file", $(this)[0].files[0]);
            $.ajax({
              url: c_url,
              type: 'POST',
              data: formData,
              cache: false,
              timeout: 3000000,
              enctype: "multipart/form-data",
              processData: false,
              contentType: false,
              error: function () {
                alert('数据加载失败，可能是网络连接问题或者服务器错误。');
              },
              success: function (result) {
                $(this).val('');
                /* "/uuu/kkj.jpg" 或者 {"message":"没有上传的文件！","url":"","method":"alert","func":""} */
                //判断返回值不是 json 格式
                var _url = '';
                if (!result.match("^\{(.+:.+,*){1,}\}$"))
                {
                  //字符串
                  _url = result;
                }
                else
                {
                  //json对象
                  var response = $.parseJSON(result);
                  if(response != undefined && response != null){
                    _url = response.url;
                    JQbox.alert(response.message);
                    return false;
                  }
                }

                //单个文件可重复上传
                if(singleRepeat){
                  $this.parent('.upload-container').find('.img_up').remove();
                }

                var max_len = number;
                if (max_len > 0) {
                  var now_len = $this.parent('.upload-container').find('.img_up').length;
                  if ((now_len + 1) >= max_len) {
                    $this.hide();
                  }
                  if (now_len >= max_len) {
                    return false;
                  }
                }
                var input_name = input_id + (max_len != 1 && !singleRepeat ? '[]': '');
                var _str = '<span class="img_up">';
                _str = _str + '<img src="' + golddiy_image_path + _url + '" width="100">';
                _str = _str + '<input type="hidden" name="' + input_name + '" value="' + _url + '">';
                if (singleRepeat != true) {
                  _str = _str + '<a class="del_img" href="javascript:;">删除</a>';
                }
                if(text){
                  _str += '<input type="text" name="' +
                    text_name +
                    '" class="wei-up-inp" placeholder="' +
                    text_placeholder +
                    '"/>';
                }
                _str = _str + '</span>';
                $this.siblings('.img_ul').append(_str);

                $('.del_img').on('click', function () {
                  var obj = $(this).parent().parent().siblings('.img_add');
                  if ('none' == obj.css('display')) {
                    obj.show();
                  }
                  $(this).parent().remove();
                });
              },
              complete: function () {}
            });
          }

        });
      }
    };
    $.fn.uploads = function (options) {
        var upload = new uploads(this, options);
        upload.init();
    };
})(jQuery, window, document);
