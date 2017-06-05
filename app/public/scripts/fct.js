
var JQCheck = {
    load: function () {
        //给checkbox提供全选
        $(".checkbox").click(function () {
            var checkall = true;
            $(".checkbox").each(function () {
                if (!$(this).attr('checked')) {
                    checkall = false;
                }
            });
            if (checkall) {
                $(".checkall").attr("checked", "checked");
            } else {
                $(".checkall").removeAttr("checked");
            }
        });
        $(".checkall").click(function () {
            if ($(this).attr("checked")) {
                $(".checkbox").attr("checked", "checked");
            } else {
                $(".checkbox").removeAttr("checked");
            }
        });
    },
    count: function () {
        return $(".checkbox:checked").length;
    },
    valid: function () {
        var bool = false;
        $(".checkbox").each(function () {
            if ($(this).attr('checked')) {
                bool = true;
                return;
            }
        });
        return bool;
    }
};

var Ajax = function (element, options) {
    options = options || {};
    var html = "";
    if (options.wait) {
        if ($(element).hasClass("disabled")) {
            return;
        }
        html = $(element).html();
        $(element).addClass("disabled");
        $(element).html(options.waitinfo || html + "...");
    }

    if (options.type == 'GET' || options.type == 'LOAD') {
        $.ajax({
            url: options.url ? options.url : "",
            type: 'GET',
            cache: false,
            timeout: 3000000,
            error: function () { if (options.containerid) { $('#' + options.containerid).html('数据加载失败'); } else { /*alert('数据加载失败，可能是网络连接问题或者服务器错误。'); */ } },
            success: options.callback,
            complete: function () { if (html != "") { $(element).html(html); } }
        });
    } else if (options.type == 'POST') {
        if (!options.url) {
            options.url = $("#" + options.form).attr("action");
        }
        var data;
        if ('object' == typeof (options.form)) {
            data = options.form;
        } else {
            data = options.form ? $('#' + options.form).serialize() : "";
        }
        $.ajax({
            url: options.url,
            type: 'POST',
            data: data,
            cache: false,
            timeout: 3000000,
            error: function () { /*alert('数据加载失败，可能是网络连接问题或者服务器错误。'); */ },
            success: options.callback,
            complete: function () { $(element).removeClass("disabled"); if (html != "") { $(element).html(html); } }
        });
    }
};
//重装jquery ajax 方法
var JQAjax = {
    get: function (element, options) {
        Ajax(element, {
            type: "GET",
            url: options.url,
            wait: options.wait,
            callback: options.callback
        });
    },
    load: function (element, url,fun) {
        var cid = element.attr("data-load");
        Ajax(element, {
            type: "LOAD",
            url: url,
            containerid: cid,
            callback: function (data) {
                $('#' + cid).html(data);
            }
        })
    },
    post: function (element, options) {
        if (options.confirm) {
            if (!confirm('你确定要执行该操作？')) {
                return;
            }
            //JQbox.confrim("你确定要执行该操作？");
        }
        $(".error").each(function () {
            $(this).hide();
        });
        Ajax(element, {
            type: "POST",
            wait: options.wait,
            url: options.url,
            form: options.form,
            waitinfo: options.waitinfo,
            callback: function (result) {
                //var data = eval('(' + result + ')');
                var data = result;
                if (data.method) {
                    switch (data.method) {
                        case "func":
                            eval(data.func);
                            break;
                        case "remind":
                            var close = "<button class='close' id='close_remind' type='button'>×</button>";
                            $('#valid_remind').html(close + data.message).show();
                            $('#close_remind').click(function () { $("#valid_remind").hide()});
                            break;
                        case "alert":
                            JQbox.alert(data.message);
                            break;
                        case "goto":
                            if (data.message) {
                                JQbox.jump(data.message, data.url);
                            } else {
                                location.href = data.url;
                            }
                            break;
                        case "reload":
                            if (data.message) {
                                JQbox.reload(data.message);
                            } else {
                                location.reload();
                            }
                            break;
                        case "error":
                            var err = data.dic;
                            for (var o in data.dic) {
                                $('#e_' + o).html(err[o]).show();
                            }
                            break;
                    }
                }
            }
        });
    }
};

var JQDialog = {
    creat: function (action,options) {
        options = options || {};

        JQAjax.get(null, {
            url: options.url,
            callback: function (t) {
                //页面层
                layer.open({
                    type: 1,
                    skin: 'layui-layer-rim', //加上边框
                    area: [options.width + 'px', options.height + "px"], //宽高
                    shift: 2,
                    title: options.title,
                    content: t
                });
            }
        });
        //$(".ui-dialog-titlebar-close").click(options.callback);
    }
};

///重写jquery dialog弹出提醒
var JQbox = {
    alert: function (message) {
        layer.msg(message);
    },
    reload: function (message) {
        $(".layui-layer").remove();
        layer.msg(message,{
            time: 2000 //2秒关闭（如果不配置，默认是3秒）
        },function () {
            location.reload();
        });
    },
    jump: function (message, url) {
        $(".layui-layer").remove();
        layer.msg(message,{
            time: 2000 //2秒关闭（如果不配置，默认是3秒）
        },function () {
            location.href = url;
        });
    },
    close: function (message, callback) {
        layer.open({
            type: 1,
            shade: false,
            title: false, //不显示标题
            content: message, //捕获的元素
            cancel: function(index){
                layer.close(index);
            }
        });
    },
    open: function (options) {
        options = options || {},
        JQDialog.creat('open',{
            title: options.title || "提示",
            url: options.url,
            width: options.width || 500,
            height: options.height || 'auto'
        });
    },
    confirm: function (message, surecall, cancelcall) {
        //询问框
        layer.confirm(message, {
            btn: ['确定', '取消'], //按钮
            title:'提示'
        }, function (index) {
            layer.close(index);
            surecall.call(this);
        }, function (index) {
            layer.close(index);
            cancelcall.call(this);
        });
    },
    prompt:function(ele,options){
        layer.prompt({
            title: options.title,
            formType: options.type || 0 //prompt风格，支持0-2
        }, function (text) {
            JQAjax.post(ele, {
                url: options.url + text,
            });
        });
    }
};


  var dropZoneUploads = {
      init: function (ele,options) {
          var input = options.input;
          var url = options.url;
          var more = options.more || false;

          Dropzone.autoDiscover = false;
          var tem_str = '<div class=\"dz-preview sortable_img dz-file-preview\">\n  ' +
              '<div class="preview-img">\n    ' +
              '<img data-dz-thumbnail />\n  ' +
              '<div data-dz-name></div>\n    ' +
              '</div>\n  ' +
              '<a name class="fork-remove" data-dz-remove />' +
              '<div class=\"dz-success-mark\"><span>✔</span></div>\n  ' +
              '<div class=\"dz-error-mark\"><span>✘</span></div>\n ' +
              ' <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n' +
              '</div>';
          $(ele).dropzone({
              url:url,
              autoProcessQueue:true,
              parallelUploads:100,
              thumbnailHeight: null,
              maxFiles:more,
              init:function(){
                  var myDropzone=this;
              },
              success: function (file, response, e) {
                  //  res.data = {
                //             img_url: 'aaaaaaaaaaaa',
                //             img_name: 'aads.png'
                //        }
                //

                  // if(!more){
                    var res = JSON.parse(response);
                    if(res.data){
                      var input = $('#photos');
                      var imgs = [];
                      imgs.push(res.data);
                      input.val(imgs);
                      // If the image is already a thumbnail:
                      this.emit('thumbnail', file, res.data.img_url);

                      // If it needs resizing:
                      // this.createThumbnailFromUrl(file, res.data.img_url);
                    }
                  // }else {

                  // }

              },
              error: function (file, errorMessage, xhr) {
                  $(file.previewTemplate).children('.dz-error-mark').css('opacity', '1')
                  console.log('error')
              },

            maxfilesexceeded: function (file) {
              this.removeAllFiles(file);
              this.addFile(file);
            },
              previewTemplate: tem_str
          });

      }
  };

    var webUploads = function (ele,opt) {

        var defaults = {
            url: '',
            input: '',
            more: false,

        };
        var options = $.extend({}, defaults, opt);

        dropZoneUploads.init(ele, options);

        var sortable = new Sortable(ele, {
          animation: 150,
          ghostClass: "sortable-ghost",
          handle: '.dz-preview'
        });
    };


