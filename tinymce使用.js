$(document).ready(function() {
	//实验报告
	tinymce.init({
		  selector: '#reportEditContent',
		  height: 500,
		  autoresize_min_height: 350,
		  theme: 'silver',
		  skin: 'pksj',
		  language: 'zh_CN',
		  menubar: true,
		  statusbar: true,
		  branding: false,
//		  resize: false,
		  code_dialog_height: 300,
		  code_dialog_width: 350,
		  codesample_dialog_width: 600,
		  codesample_dialog_height: 450,
		  template_popup_width: 600,
		  template_popup_height: 450,
		  menubar: 'file edit insert view format table tools',
		  plugins: 'preview fullpage searchreplace autolink directionality visualblocks visualchars fullscreen image template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools contextmenu colorpicker textpattern',
		  toolbar: 'undo redo | bold italic underline strikethrough forecolor backcolor removeformat | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | template codesample image | preview fullscreen | screencapture',
//		  external_plugins: {
//		     'asciimath': ctx + '/static/lib/tinymce/plugins/asciimath/editor_plugin.js'
//		  },
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
//        fontsize_formats: '9px 10px 12px 13px 14px 16px 18px 21px 24px 28px 32px 36px',
//        style_formats_merge : true,
//        style_formats: [ //初始时提供的默认格式
//            {title: 'Bold text', inline: 'b'},
//            {title: 'Red text', inline: 'span', styles: {color: '#ff0000'}},
//            {title: 'Red header', block: 'h1', styles: {color: '#ff0000'}},
//        ],
//		  advlist_bullet_styles: 'square',
//		  advlist_number_styles: 'lower-alpha,lower-roman,upper-alpha,upper-roman',
		  image_advtab: false,// enable title field in the Image dialog
		  automatic_uploads: false,// enable automatic uploads of images represented by blob or data URIs
		  file_picker_types: 'image', //file image media // here we add custom filepicker only to Image dialog
//		  file_picker_callback: function(callback, value, meta) {// and here's our custom image picker
//		    if (meta.filetype == 'file') {// Provide file and text for the link dialog
//		      callback('mypage.html', {text: 'My text'});
//		    }
//		    if (meta.filetype == 'image') {// Provide image and alt text for the image dialog
//		      callback('myimage.jpg', {alt: 'My alt text'});
//		    }
//		    if (meta.filetype == 'media') {// Provide alternative source and posted for the media dialog
//		      callback('movie.mp4', {source2: 'alt.ogg', poster: 'image.jpg'});
//		    }
//		    var input = document.createElement('input');
//		    input.setAttribute('type', 'file');
//		    input.setAttribute('accept', 'image/*');
//		    input.onchange = function() {//内部转换
//		      var file = this.files[0];
//		      var reader = new FileReader();
//		      reader.onload = function () {
//		    	  var id = 'blobid' + (new Date()).getTime();
//		          var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
//		          var base64 = reader.result.split(',')[1];
//		          var blobInfo = blobCache.create(id, file, base64);
//		          blobCache.add(blobInfo);
//		          callback(blobInfo.blobUri(), { title: file.name });
//		      };
//		      reader.readAsDataURL(file);
//		    };
//		    input.onchange = function() {//内部上传
//		      var file = this.files[0];
//            if (fileUploadControl.files.length > 0) {
//            	var localFile = fileUploadControl.files[0];
//            	if (/.(gif|jpg|jpeg|png|bmp)$/.test(localFile.name)){
//              	var formData = new FormData();
//              	formData.append("image", localFile);
//              	$.ajax({
//                  	url: '{% url 'upload_img' %}',
//                  	type: 'POST',
//                  	data: formData,
//                  	cache: false,
//                  	contentType: false,
//                  	processData: false,
//                  	success: function (data) {
//                      	callback(data, {alt: localFile.name});
//                  	},
//                  	error:function () {
//                      	alert('图片上传失败')
//                  	}
//              	});
//           	} else {
//              	alert('只能上传图片')
//          	}
//      	 } else {
//           	alert('请选择图片上传')
//      	 }
//		    };
//		    input.click();
//		  },
		  image_advtab: true,//图片高级选项
		  images_reuse_filename: true,
//		  object_resizing : false,//禁用调整表格或者图片
//		  images_dataimg_filter: function(img) {
//			  return img.hasAttribute('internal-blob');
//		  },
		  images_upload_handler: function (blobInfo, success, failure) {
			  if (blobInfo.blob().size > (5*1024*1024)) {
				  failure('图片过大，不能超过5M');
				  return;
			  }
			  var fileType = (blobInfo.blob().type).toLowerCase();
			  if (fileType == 'image/jpeg' || fileType == 'image/jpg' || fileType == 'image/png' || fileType == 'image/bmp') {
				  	var xhr, formData;
				    xhr = new XMLHttpRequest();
				    xhr.withCredentials = false;
				    xhr.open('POST', ctx + '/textedit/imageupload');
				    xhr.onload = function() {
				      var json;
				      if (xhr.status != 200) {
				    	  failure('http error: ' + xhr.status);
				    	  return;
				      }
				      json = JSON.parse(xhr.responseText);
				      if (!json || typeof json.location != 'string') {
				    	  failure('invalid json: ' + xhr.responseText);
				    	  return;
				      }
				      success(json.location);
				    };
				    formData = new FormData();
				    formData.append('file', blobInfo.blob(), blobInfo.filename());
				    xhr.send(formData);
			  } else {
				  failure('图片格式错误,只支持jpeg、jpg、png、bmp');
				  return;
			  }
		  },
//		  paste_data_images: true, //粘贴图片
//		  paste_auto_cleanup_on_paste : true, //粘贴清除
//		  paste_remove_styles: true, //粘贴清除样式
//		  paste_remove_styles_if_webkit: true, //粘贴清除
//		  paste_strip_class_attributes: true, //粘贴清除树形
//		  convert_urls :false,
//		  file_browser_callback: function(field_name, url, type, win){
//	         if(type=='image'){
//	            $('#my_form input').click();
//	         };
//		  },
		  templates: [
		    {title: '实验报告模版一', description: '这是一个简单的实验报告模版', url: ctx + '/common/template/experiment_report1.html'},
		    {title: '实验报告模版二', description: '这是一个简单的实验报告模版', url: ctx + '/common/template/experiment_report2.html'}
		  ],
//		  content_style: [
//		     'body{max-width:700px; padding:30px; margin:auto;font-size:16px;font-family:Lato,"Helvetica Neue",Helvetica,Arial,sans-serif; line-height:1.3; letter-spacing: -0.03em;color:#222} h1,h2,h3,h4,h5,h6 {font-weight:400;margin-top:1.2em} h1 {} h2{} .tiny-table {width:100%; border-collapse: collapse;} .tiny-table td, th {border: 1px solid #555D66; padding:10px; text-align:left;font-size:16px;font-family:Lato,"Helvetica Neue",Helvetica,Arial,sans-serif; line-height:1.6;} .tiny-table th {background-color:#E2E4E7}'
//		  ],
		  content_css: ctx + '/static/css/experiment/experimentreport.css',
//		  table_default_styles: {
//			  width: '100%',
//			  borderCollapse: 'collapse',
//			  borderSpacing: '0',
//			  border: '0'
//        },
//		  visual_anchor_class: 'tiny-table',
//		  visual_table_class: 'tiny-table',
//		  visual: true,
		  browser_spellcheck: true,
		  relative_urls: false,
//		  remove_script_host: false,
		  encoding: "xml",
//		  valid_styles: {
//		      "*": "border,font-size",
//		      "div": "width,height"
//		  },
		  invalid_elements : 'javascript,script,iframe,frameset,link,object',// 不允许用户添加的元素 // 默认情况下style标签和script标签都不允许添加的								
		  valid_children : '+body[style]',// 如果你要放开style标签给用户,可以这么做		
//		  autosave_interval: '20s',
          setup: function (editor) {
        	  editor.ui.registry.addButton('screencapture', {
            	 tooltip: '截取实验屏幕',
            	 text: '截取实验屏幕',
                 icon: 'cut',
                 onAction: function (_) {
                   	// 传入图片地址
					var vncFrame = document.getElementById('vncFrame');
					// 获取iFrame的src
					var iframe_src = document.getElementById('vncFrame').src;
					// 获取父级页面地址栏
					var parentUrl = window.location.href ;
					var data = {"parentUrl": parentUrl};
					// 往vnc.html发送数据
					vncFrame.contentWindow.postMessage(data, iframe_src);
                 }
             });
             
             // 接受vnc.html返回数据
             window.addEventListener('message', function(e) {
            	 var dataJSON = JSON.parse(e.data);
            	 $.ajax({
	   				  url: ctx + '/textedit/imagebase64upload',
	   				  type: 'POST',
	   				  data: {
	   					 imageStr : dataJSON.src
	   			      },
	   				  dataType: 'json',
	   				  beforeSend: function(xhr) {
	   					  xhr.setRequestHeader('X-PJAX', 'true');
	   				  },
	   				  error: function(data) {
	   					  layer.msg("出错了！请联系管理员", {icon: 2});	 
	   					  return false;
	   				  },
	   				  success: function(data) {
		   				  if (data.code == 1000) {
		   					 editor.insertContent('<img src="' + data.data + '" style="max-width:100%;"/>');
		   				  } else {
		   					 layer.msg(data.msg, {icon: 5}); 
		   				  }
	   				  }
	   			});
//            	 editor.insertContent('<img src="' + dataJSON.src + '" style="max-width:100%;"/>');
//            	 editor.execCommand('mceReplaceContent', false, '<img src="' + dataJSON.src + '" style="max-width:100%;"/>')
             }, false);
             
             //监听编辑器内容改变
             editor.on('change', function(e) {
            	// html 即变化之后的内容, 且不为空
            	if (editor.getBody().innerHTML != null && editor.getBody().innerHTML != '<p><br data-mce-bogus="1"></p>') {
        	    	$('#reportChangeFlag').attr('value', "1");
            	}
             });
             
            //提交
            $('.editor_fabu').on('click', function() {
            	$('.editor_fabu').hide();
            	$('.editor_fabuing').show();
            	var courseId = $('#courseId').val();
            	var experimentId = $('#experimentId').val();
//            	var activeEditor = tinymce.activeEditor; 
//            	var editBody = tinymce.activeEditor.getBody(); 
//            	activeEditor.selection.select(editBody); 
//            	var content = activeEditor.selection.getContent( { 'format' : 'text' } );
            	if (editor.getBody().innerHTML != null && editor.getBody().innerHTML != '<p><br data-mce-bogus="1"></p>') {
        	    	$.ajax({
        	    		url: ctx + '/experimentreport/saveexperimentreport',
        	    		type: 'POST',
        	    		data:{
        	    			courseId : courseId, //课程ID
        	    			experimentId : experimentId, //实验ID
            				reportContent : editor.getContent(),
        	    		},
        	    		dataType: "json", 
        	 			beforeSend: function(xhr) {
        	 				xhr.setRequestHeader('X-PJAX', 'true');
        	 			},
        	 			error: function(data) {
        	 				layer.alert("出错了！请联系管理员", {icon: 2});	 
        	 				return false;
        	 			},
        	 			success: function(data) {
        	 				if (data.code == 1000) {
        	 					layer.msg(data.msg, {icon: 1}); 
        	 					$('#reportChangeFlag').attr('value', "");
        	 					$('.editor_fabu').show();
        						$('.editor_fabuing').hide();
        	 				} else {
        	 					layer.msg(data.msg, {icon: 5}); 
        	 					$('.editor_fabu').show();
        						$('.editor_fabuing').hide();
        	 				}
        	 			}
        	    	});
        	    } else {
        	    	layer.msg("实验报告填写后，方可提交！", {icon: 0});
        	    	$('.editor_fabu').show();
					$('.editor_fabuing').hide();
        	    }
            });

             //弹窗例子            
//           editor.windowManager.open({
//            	title: 'Insert Random Shortcode',
//            	body: [
//	            	{
//		            	type: 'textbox',
//		            	name: 'textboxName',
//		            	label: 'Text Box',
//		            	value: '30'
//	            	},
//	            	{
//		            	type: 'textbox',
//		            	name: 'multilineName',
//		            	label: 'Multiline Text Box',
//		            	value: 'You can say a lot of stuff in here',
//		            	multiline: true,
//		            	minWidth: 300,
//		            	minHeight: 100
//	            	},
//	            	{
//		            	type: 'listbox',
//		            	name: 'listboxName',
//		            	label: 'List Box',
//		            	values: [
//		            		{text: 'Option 1', value: '1'},
//		            		{text: 'Option 2', value: '2'},
//		            		{text: 'Option 3', value: '3'}
//		            	]
//	            	}
//            	],
//            	onsubmit: function( e ) {
//            		editor.insertContent( '[random_shortcode textbox="' + e.data.textboxName + '" multiline="' + e.data.multilineName + '" listbox="' + e.data.listboxName + '"]');
//            	}
//        	});
         },
         destroyed () {                        
             tinymce.get('reportEditContent').destroy();
         } 
	});
});