var Ajax = function (element, options) {
    options = options || {};
    var html = '';
    if (options.wait) {
        if ($(element).hasClass('disabled')) {
            return;
        }
        html = $(element).html();
        $(element).addClass('disabled');
        $(element).html(options.waitinfo || html+'中...');
    }

    if (options.type == 'GET' || options.type == 'LOAD') {
        $.ajax({
            url: options.url ? options.url : '',
            type: 'GET',
            cache: false,
            timeout: 3000000,
            error: function () { if (options.containerid) { $('#' + options.containerid).html('数据加载失败'); } else { /*alert('数据加载失败，可能是网络连接问题或者服务器错误。'); */} },
            success: options.callback,
            complete: function () { if (html != '') { $(element).html(html); } }
        });
    } else if (options.type == 'POST') {
        if (!options.url) {
            options.url = $('#' + options.form).attr('action');
        }
        var data;
        if ('object' == typeof(options.form)) {
            data = options.form;
        } else {
            data = options.form ? $('#' + options.form).serialize() : '';
        }
        $.ajax({
            url: options.url,
            type: 'POST',
            data: data,
            cache: false,
            timeout: 3000000,
            error: function () { /*alert('数据加载失败，可能是网络连接问题或者服务器错误。'); */},
            success: options.callback,
            complete: function () { $(element).removeClass('disabled'); if (html != '') { $(element).html(html); } }
        });
    }
};
var JQAjax = {
    get: function (element, options) {
        Ajax(element, {
            type: 'GET',
            url: options.url,
            wait: options.wait,
            callback: options.callback
        });
    },
    load: function (element, url) {
        var cid = element.attr('data-load');
        Ajax(element, {
            type:'LOAD',
            url:url,
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
        $('.error').each(function () {
            $(this).hide();
        });
        Ajax(element,{
            type:'POST',
            wait: options.wait,
            url:options.url,
            form: options.form,
            waitinfo:options.waitinfo,
            callback: function (result) {
                var data = eval('(' + result + ')');
                if (data.method) {
                    switch (data.method) {
                        case 'func':
                            eval(data.func);
                            break;
                        case 'remind':
                            $('#e_remind').html(data.message).show();
                            break;
                        case 'alert':
                            JQbox.alert(data.message);
                            break;
                        case 'goto':
                            if (data.message) {
                                JQbox.jump(data.message, data.url);
                            } else {
                                location.href = data.url;
                            }
                            break;
                        case 'reload':
                            if (data.message) {
                                JQbox.reload(data.message);
                            } else {
                                location.reload();
                            }
                            break;
                        case 'error':
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

var JQDialog ={
    creat:function(options){
        options = options || {};
        if (!options.type) {
            return;
        }
        if ($('#dialog')) {
            $('#dialog').dialog('destroy').remove();
        }
        var json = { 'modal':options.modal ? options.modal :false,
            'resizable': options.resizable ? options.resizable :false,
            'bgiframe': options.bgiframe ? options.bgiframe : false,
            'title':options.title,minHeight : 0,maxWidth:180
        };
        if (options.height) {
            json.height = options.height;
        }
        else {
            json.height = 'auto';
        }
        if(options.width){
            json.width = options.width;
        }
        else{
            json.width='auto';
        }
        if(options.buttons){
            json.buttons = options.buttons;
        }
        if (options.type == 'open') {
            var self = this;
            JQAjax.get(null,{
                url:options.url,
                callback:function (t) {
                    self.show(t, json);
                }
            });
        }else{
            var html = '<p class=\'jqalert\'>';
            html += options.content + '</p>';
            this.show(html, json);
        }

        switch (options.type) {
            case 'reload':
                setTimeout(''+ options.callback +'', 2000);
                break;
            case 'alert':
                setTimeout('$(\'#dialog\').dialog(\'close\')', 2000);
                break;
            case 'jump':
                setTimeout(''+ options.callback +'', 2000);
                break;
            case 'close':
                $('.ui-dialog-titlebar-close').click(options.callback);
                break;
        }
    },
    show:function (html,options) {
        var body = document.getElementsByTagName('body').item(0);
        var div = document.createElement('div');
        div.id = 'dialog';
        div.innerHTML = html;
        body.appendChild(div);
        $('#dialog').dialog(options);
    }
};

var JQbox = {
    alert: function (message) {
      //提示
      layer.open({
        content: message
        ,skin: 'msg'
        ,time: 3 //3秒后自动关闭
      });
    },
    reload: function (message) {
      //提示后刷新
      layer.open({
        content: message
        ,skin: 'msg'
        ,time: 3
        ,end: function (index) {
          location.reload();
        }
      });
    },
    jump: function (message,url) {
      //提示后跳转
      layer.open({
        content: message
        ,skin: 'msg'
        ,time: 3
        ,end: function (index) {
          location.href = url;
        }
      });
    },
    close: function (message, callback) {
        JQDialog.creat({
            type: 'close',
            title: '提示',
            content: message,
            callback: callback,
            modal:true
        });
    },
    open: function (options) {
      options = options || {};
      JQAjax.get(null,{
        url:options.url,
        callback:function (html) {
          // self.show(html, options);

          //自定义标题风格
          layer.open({
            title: [
              options.title,
              'background-color: #FF4351; color:#fff;'
            ]
            ,content: html
          });
        }
      });

    },
    confirm: function (message, surecall, cancelcall) {
      //询问框
      layer.open({
        content: message
        ,btn: ['确定', '取消']
        ,yes: function(index){
          layer.close(index);
          surecall.call(this);
        }
        ,no: function (index) {
          layer.close(index);
          cancelcall.call(this);
        }
      });
    }
};

