'use strict';
angular.module('dleduWebApp')
    .controller('NoVNCTeachingCtrl', function($scope, $rootScope, $state, CourseService, AuthService, messageService,
                                               uploadService, seFileService, ResourcelibService, $timeout, ngDialog,
                                              SchoolService,$compile,$base64, $interval) {
        /**
         * 此控制层是创建和编辑共用
         *
         */
        var keyboard;
        var mouse;
        var guac;
        var websocket;
        var display;
        var rfb;
        
        $scope.teachingFn = {
            
            //显示远程桌面
            guacamole: function (host, id) {
                var _this = this;
                // Instantiate client, using an HTTP tunnel for communications.

                /*var guac = new Guacamole.Client(
                 //new Guacamole.HTTPTunnel("http://localhost/remote-desktop-server/tunnel", true)
                 new Guacamole.HTTPTunnel(host + "/tunnel", true)
                 );*/
                // Get display div from document
                display = document.getElementById("desk");
                display.innerHTML = "";
                var containerId = id;
                // Instantiate client, using an HTTP tunnel for communications.
                websocket = new Guacamole.WebSocketTunnel(host);
                guac = new Guacamole.Client(websocket);
                // Add client to display div
                if(display.contains(guac.getDisplay().getElement())){
                    display.removeChild(guac.getDisplay().getElement());
                }
                display.appendChild(guac.getDisplay().getElement());

                // Error handler
                guac.onerror = function (error) {
                    loading(false,'all');
                    console.log(JSON.stringify(error))
                };
                function loading(status, type) {
                    var divParent = '.show-container', imgSub = 'show-loading-img';
                    if(type == 'part'){
                        divParent = '.show-container-part';
                        imgSub = 'show-loading-imgsub';
                    }
                    var html = '<div class="show-curtain"><img class="' + imgSub + '" src="https://s1.aizhixin.com/763a9dd3-07bd-4087-bc2b-74467f5d48d4.gif"></div>';
                    $('body').append('<div class="show-container"></div>');
                    if (status) {
                        if ($(divParent + ' .show-curtain').length === 0) {
                            $(divParent).append(html);
                        }
                    } else {
                        $(divParent + ' .show-curtain').remove();
                        $(".show-container").remove();
                    }
                };
                guac.onstatechange = function(data){
                    if(data == 2){
                        loading(true,'all');
                    }else{
                        loading(false,'all');
                        _this.isShowToop = true;
                    }
                };
                // var connect_string = window.location.search.substring(1);
                // Connect
                guac.connect();

                // Disconnect on close
                window.onunload = function () {
                    guac.disconnect();
                }
                // Mouse
                mouse = new Guacamole.Mouse(guac.getDisplay().getElement());

                mouse.onmousedown =
                    mouse.onmouseup =
                        mouse.onmousemove = function (mouseState) {
                            if(guac){
                                guac.sendMouseState(mouseState);
                            }else{
                                console.log("********");
                                console.log(guac);
                            }
                        };

                // Keyboard
                keyboard = new Guacamole.Keyboard(document);
                // keyboard.listenTo(document);

                keyboard.onkeydown = function (keysym) {
                    if(guac){
                        guac.sendKeyEvent(1, keysym);
                    }
                };

                keyboard.onkeyup = function (keysym) {
                    if(guac){
                        guac.sendKeyEvent(0, keysym);
                    }
                };
                //监听堡垒机端往剪切板复制事件，然后写入文本框中
                guac.onclipboard = function (stream, mimetype) {
                    if (/^text\//.exec(mimetype)) {
                        var stringReader = new Guacamole.StringReader(stream);
                        var json = "";
                        stringReader.ontext = function ontext(text) {
                            json += text
                        }

                        stringReader.onend = function () {
                            _this.clipboardParams.content = '';
                            _this.clipboardParams.content = json;
                        }
                    }
                }
            },

            //显示远程桌面
            noVNC: function (agentURL, host, pwd, port) {
                var _this = this;
                var desktopName;

                // When this function is called we have
                // successfully connected to a server
                function connectedToServer(e) {
                    //status("Connected to " + desktopName);
                }

                // This function is called when we are disconnected
                function disconnectedFromServer(e) {
                    if (e.detail.clean) {
                        status("Disconnected");
                    } else {
                        //_this.initVm();
                        console.log("********");
                        _this.loading(false,'all');
                        messageService.openMsg("请重新开启实验！");
                        status("Something went wrong, connection is closed");
                        console.log("Something went wrong, connection is closed");
                    }
                }

                // When this function is called, the server requires
                // credentials to authenticate
                function credentialsAreRequired(e) {
                    const password = prompt("Password Required:");
                    rfb.sendCredentials({ password: password });
                }

                // When this function is called we have received
                // a desktop name from the server
                function updateDesktopName(e) {
                    desktopName = e.detail.name;
                }

                // Since most operating systems will catch Ctrl+Alt+Del
                // before they get a chance to be intercepted by the browser,
                // we provide a way to emulate this key sequence.
                function sendCtrlAltDel() {
                    rfb.sendCtrlAltDel();
                    return false;
                }

                // Show a status text in the top bar
                function status(text) {
                    //document.getElementById('status').textContent = text;
                }

                // This function extracts the value of one variable from the
                // query string. If the variable isn't defined in the URL
                // it returns the default value instead.
                function readQueryVariable(name, defaultValue) {
                    // A URL with a query parameter can look like this:
                    // https://www.example.com?myqueryparam=myvalue
                    //
                    // Note that we use location.href instead of location.search
                    // because Firefox < 53 has a bug w.r.t location.search
                    const re = new RegExp('.*[?&]' + name + '=([^&#]*)'),
                        match = document.location.href.match(re);
                    if (typeof defaultValue === 'undefined') { defaultValue = null; }

                    if (match) {
                        // We have to decode the URL since want the cleartext value
                        return decodeURIComponent(match[1]);
                    }

                    return defaultValue;
                }


                // Read parameters specified in the URL query string
                // By default, use the host and port of server that served this file
                var host = readQueryVariable('host', host);
                var port = readQueryVariable('port', port);
                var password = readQueryVariable('password', pwd);
                var path = readQueryVariable('path', 'websockify');

                // | | |         | | |
                // | | | Connect | | |
                // v v v         v v v

                status("Connecting");

                // Build the websocket URL used to connect
               /* var url = 'ws';
                url += '://';
                if(port) {
                    url += ':6901' + port;
                }
                url += '/' + path;*/

                // Creating a new RFB object will start a new connection
                var url;
                //url = 'ws://172.16.40.21:6901';
                //url = 'ws://'+ host + ":" + port;
                //url = 'ws://172.16.40.21:6901/' + path;
                //url = "ws://" + host + ":" + port + "/" + path;
                //url = "ws://desk.dlztc.com" + "?token=MTcyLjE2LjQwLjIxOjU5MDE%3d";
				var path = encodeURIComponent($base64.encode(host + ":" + port));
				//url = "ws://desk.dlztc.com" + "?token=" + path;
                url = agentURL.replace("http://","ws://") + "?token=" + path;
                /*rfb = new RFB(document.getElementById('desk'), url,
                    { credentials: { password: '12345678' },wsProtocols: ['binary'] });*/
                var display = document.getElementById("desk");
                display.innerHTML = "";
                rfb = new RFB(document.getElementById('desk'), url,
                    { credentials: { password: pwd },wsProtocols: ['binary'] });

                // Add listeners to important events from the RFB module
                rfb.addEventListener("connect",  _this.connectedToServer);
                rfb.addEventListener("disconnect", disconnectedFromServer);
                rfb.addEventListener("credentialsrequired", credentialsAreRequired);
                rfb.addEventListener("clipboard", _this.clipboardReceive);
                rfb.addEventListener("desktopname", updateDesktopName);

                // Set parameters that can be changed on an active connection
                rfb.viewOnly = readQueryVariable('view_only', false);
                //rfb.scaleViewport = true;
                rfb.resizeSession = true;
                _this.loading(true,'all');
            },

            clipboardReceive: function(e) {
                var _this = $scope.teachingFn;
                _this.clipboardParamsVNC.content = e.detail.text;
            },

            clipboardClear: function() {
                this.clipboardParamsVNC.content='';
                rfb.clipboardPasteFrom("");
            },

            clipboardSend: function() {
                var text = this.clipboardParamsVNC.content;
                rfb.clipboardPasteFrom(text);
            },

            loading: function(status, type, partId) {
                var divParent = '.show-container', imgSub = 'show-loading-img';
                if(type == 'part'){
                    divParent = '.show-container-part';
                    imgSub = 'show-loading-imgsub';
                }
                var html = '<div class="show-curtain"><img class="' + imgSub + '" src="https://s1.aizhixin.com/763a9dd3-07bd-4087-bc2b-74467f5d48d4.gif"></div>';
                if(type != 'part'){
                    $('body').append('<div class="show-container"></div>');
                }else{
                    $(partId).append('<div class="show-container-part"></div>');
                }
                if (status) {
                    if ($(divParent + ' .show-curtain').length === 0) {
                        $(divParent).append(html);
                    }
                } else {
                    //$(divParent + ' .show-curtain').remove();
                    $(divParent).remove();
                    $(".show-container").remove();
                }
            },
            connectedToServer: function(e){
                var _this = $scope.teachingFn;
                _this.loading(false,'all');
                _this.isShowToop = true;
                $scope.$apply();
            },

            
            openClipboardLab: function(){
                var openName = 'confirmGuacClipboard';
                if(!guac){
                    openName = 'confirmVNCClipboard';
                }
                ngDialog.open({
                    template: openName,
                    width: 500,
                    className: 'zxdialog-theme-default',
                    scope: $scope,
                    onOpenCallback: function(){
                        if(keyboard){
                            keyboard.onkeydown = null;
                            keyboard.onkeyup = null;
                        }
                    },
                    preCloseCallback: function(){
                        if(keyboard){
                            keyboard.onkeydown = function(keysym) {
                                guac.sendKeyEvent(1, keysym);
                            };
                            keyboard.onkeyup = function(keysym) {
                                guac.sendKeyEvent(0, keysym);
                            };
                        }

                    }
                })
            },

            //使用剪切板
            onclipboardLab: function(){
                var _this = this;
                _this.setClipboard(_this.clipboardParams.content);
            },

            setClipboard: function(data){
                var _this = this;
                var stream = guac.createClipboardStream("text/plain");
                var writer = new Guacamole.StringWriter(stream);
                for (var i = 0; i < data.length; i += 4096) {
                    writer.sendText(data.substring(i, i + 4096));
                }
                writer.sendEnd();
            },

            fullScreen: function(){
                // 判断各种浏览器，找到正确的方法
                var el = document.getElementById("desk");
                var requestMethod = el.requestFullScreen || //W3C
                    el.webkitRequestFullScreen || //Chrome等
                    el.mozRequestFullScreen || //FireFox
                    el.msRequestFullScreen; //IE11
                if (requestMethod) {
                    requestMethod.call(el);
                }
                else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
                    var wscript = new ActiveXObject("WScript.Shell");
                    if (wscript !== null) {
                        wscript.SendKeys("{F11}");
                    }
                }
            },


           

            initTinymce: function(){
                var that = this;
                tinymce.init({
                    selector: '#mytextarea',
                    height: 500,
                    autoresize_min_height: 350,
                    theme: 'silver',
                    skin: 'oxide-dark',
                    language: 'zh_CN',
                    menubar: true,
                    statusbar: true,
                    branding: false,
                    //resize: false,
                    code_dialog_height: 300,
                    code_dialog_width: 350,
                    codesample_dialog_width: 600,
                    codesample_dialog_height: 450,
                    template_popup_width: 600,
                    template_popup_height: 450,
                    //menubar: 'file edit insert view format table tools',
                    plugins: 'preview fullpage searchreplace autolink directionality visualblocks visualchars fullscreen image template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools contextmenu colorpicker textpattern',
                    toolbar: 'undo redo | bold italic underline strikethrough forecolor backcolor removeformat | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | codesample image | preview fullscreen | screencapture',
                    font_formats: '\u5b8b\u4f53=\u5b8b\u4f53;' + //此处为初始默认字体样式，可不写
                    '\u9ed1\u4f53=\u9ed1\u4f53;' +
                    '\u5e7c\u5706=\u5e7c\u5706;' +
                    "Arial=arial,helvetica,sans-serif;" +
                    "Arial Black=arial black,avant garde;" +
                    "Book Antiqua=book antiqua,palatino;" +
                    "Comic Sans MS=comic sans ms,sans-serif;" +
                    "Impact=impact,chicago;" +
                    "Symbol=symbol;" +
                    "Terminal=terminal,monaco;" +
                    "Times New Roman=times new roman,times;" +
                    "Trebuchet MS=trebuchet ms,geneva;" +
                    "Verdana=verdana,geneva;" +
                    "Webdings=webdings;" +
                    "Wingdings=wingdings,zapf dingbats",
                    image_advtab: true,//图片高级选项
                    images_reuse_filename: true,

                    images_upload_handler: function (blobInfo, success, failure) {
                        if (blobInfo.blob().size > (5*1024*1024)) {
                            messageService.openMsg('图片过大，不能超过5M');
                            return;
                        }
                        var fileType = (blobInfo.blob().type).toLowerCase();
                        if (fileType == 'image/jpeg' || fileType == 'image/jpg' || fileType == 'image/png' || fileType == 'image/bmp') {
                            var file;
                            file =  blobInfo.blob();
                            uploadService.fileUploadToQiNiu(file).then(function (resp) {
                                var imgUrl = resp.data.url;
                                success(imgUrl);
                            }, function (err) {
                                console.log(err);
                            });
                        } else {
                            failure('图片格式错误,只支持jpeg、jpg、png、bmp');
                            return;
                        }
                    },

                    browser_spellcheck: true,
                    relative_urls: false,
                    encoding: "xml",
                    invalid_elements : 'javascript,script,iframe,frameset,link,object',// 不允许用户添加的元素 // 默认情况下style标签和script标签都不允许添加的
                    valid_children : '+body[style]',// 如果你要放开style标签给用户,可以这么做
                    //autosave_interval: '20s',
                    setup: function (editor) {
                        editor.ui.registry.addButton('screencapture', {
                            tooltip: '截取实验屏幕',
                            text: '截取实验屏幕',
                            icon: 'cut',
                            onAction: function (_) {
                                // 传入图片地址
                                var desk = document.getElementById('desk');
                                var img;
                                if(that.resultStart){
                                    if(that.resultStart.agreement == 'vnc'){
                                        img = desk.getElementsByTagName('canvas')[0].toDataURL();
                                    }else{
                                        img = desk.getElementsByTagName('canvas')[1].toDataURL();
                                    }
                                }else{
                                    messageService.openMsg("请选开启实验！");
                                    return;
                                }

                                var file = that.dataURLtoFile(img, '截图.png');

                                uploadService.fileUploadToQiNiu(file).then(function (resp) {
                                    var imgUrl = resp.data.url;
                                    editor.insertContent('<img src="' + imgUrl + '" style="max-width:100%;"/>');
                                }, function (err) {
                                    console.log(err);
                                });
                            }
                        });



                        //监听编辑器内容改变
                        editor.on('change', function(e) {
                            if (editor.getBody().innerHTML != null && editor.getBody().innerHTML != '<p><br data-mce-bogus="1"></p>') {
                            }
                        });
                    },
                    destroyed: function () {
                        tinymce.get('mytextarea').destroy();
                    }
                });
                /*tinyMCE.activeEditor.on('change', function(e) {
                    if (tinyMCE.activeEditor.getBody().innerHTML != null && tinyMCE.activeEditor.getBody().innerHTML != '<p><br data-mce-bogus="1"></p>') {
                        alert();
                    }
                });*/
            },

            dataURLtoFile: function(dataurl, filename) {
                var arr = dataurl.split(','),
                    mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]),
                    n = bstr.length,
                    u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new File([u8arr], filename, { type: mime });
            },

            

            swiper: function(){
                var _this = this;
                $timeout(function () {
                    var swipers = new Swiper('.swiper-container', {
                        pagination: '.swiper-pagination',
                        nextButton: '.swiper-button-next',
                        prevButton: '.swiper-button-prev',
                        //slidesPerView: 1,
                        //centeredSlides: true,
                        paginationClickable: true,
                        spaceBetween: 0,
                        observer:true,//修改swiper自己或子元素时，自动初始化swiper
                        observeParents:true,//修改swiper的父元素时，自动初始化swiper
                        //loop: true,
                        onSlideChangeStart: function() {
                            //var index = swipers.activeIndex;
                        }

                    });
                    _this.swipers = swipers;
                }, 10)
            },

            //页面初始化
            init: function() {
                var that = this;
                that.labContent.width = document.getElementById('right').offsetWidth - 500;
                that.isStu = $state.current.name == "stuteaching";
                that.showType = 'desk';
                if(that.isStu){
                    that.initTinymce();
                }
                that.getChapterListWithFile();
                that.swiper();
            }
        };
        $timeout(function() {
            $scope.teachingFn.init();
            $scope.$watch('teachingFn.clipboardParams.content', function(newValue, oldValue) {
                if (newValue != oldValue){
                    $scope.teachingFn.onclipboardLab();
                }
            });
            $scope.$watch('teachingFn.clipboardParamsVNC.content', function(newValue, oldValue) {
                if (newValue != oldValue){
                    $scope.teachingFn.clipboardSend();
                }
            });
            $scope.$watch('teachingFn.uploadParams.myFile', function(newValue, oldValue) {
                if (newValue){
                    $scope.teachingFn.tipUpload = false;
                }
            });
            $scope.$on("$destroy", function() {
                if(guac){
                    guac.disconnect();
                    guac = null;
                    websocket.disconnect();
                    websocket = null;
                    keyboard.onkeydown = null;
                    keyboard.onkeyup = null;
                    keyboard = null;
                    mouse.onmousedown = null;
                    mouse.onmouseup = null;
                    mouse.onmousemove = null;
                    mouse = null;
                    $scope.teachingFn.isShowToop = false;
                }
                if(tinymce && $scope.teachingFn.isStu){
                    tinymce.get('mytextarea').destroy();
                }
               
            })
        })
    });