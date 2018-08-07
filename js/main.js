/**
 * Created by flyer on 2018/5/22.
 */
var curEditor;
var AllTabs = {};
var index = 1
var MTitle = "Makrdown编辑器"
$(function () {
    editormd.markdownToHTML("PreDestop", {//注意：这里是上面DIV的id
        htmlDecode: "style,script,iframe",
        emoji: true,
        taskList: true,
        tex: true, // 默认不解析
        flowChart: true, // 默认不解析
        sequenceDiagram: true, // 默认不解析
        codeFold: true,
        tocm: true
    });
    $('.nav-main>li[id]').hover(function () {
        /*下拉框出现*/
        var Obj = $(this).attr('id');
        num = Obj.substring(3, Obj.length);
        $('#box-' + num).slideDown(500);
    }, function () {
        /*下拉框消失*/
        $('#box-' + num).hide();
    });

    //hidden-box hover e
    $('.hidden-box').hover(function () {
        $(this).show();

    }, function () {
        $(this).slideUp(300);
    });

    $('#TabBar').tabs({
        width: "100%",
        height: "21px"
    }).tabs('resize');

    $('#TabBar').tabs({
        border: false,
        onSelect: function (title, index) {
            console.log(title);
            if (curEditor) {
                if (curEditor.title !=  title){
                    $(curEditor.divId).hide();
                }
            }
            curEditor = AllTabs[title];
            console.log(curEditor.divId);
            $(curEditor.divId).show();
            if (curEditor.hasChange && !curEditor.isNew) {
                document.title = MTitle + " · " + title+" *"
                return;
            }
            document.title =  MTitle + " · " + title;
        },
        onBeforeClose: function (title, index) {
            console.log(title, curEditor);
            var content = curEditor.instant.getHTML();
            //alert(content);
            if (curEditor.hasChange && content.length!=0) {
                var r =confirm("是否保存?");
                if (r) {
                    var content = curEditor.instant.getMarkdown();
                    //alert(content);
                    saveFile(true);
                }
            }
            curEditor.instant.editor.remove();
            delete AllTabs[title];
            curEditor = null;
            document.title =  MTitle
            return true;
        }
    });
    addNewTab("new "+index+" *", "", true)
});
var fs = require("fs");

function readFile(path) {
    fs.readFile(path, "utf-8", function (err, data) {
        if (err) {
            alert("读取文件失败! :" + err.message);
        } else {
            console.log(data.toString());
            var tab = addNewTab(path, data.toString(), false);
            document.title = MTitle + " · " + path;
        }
    })
}

$("file-dir").click(function () {
    var fileControl = document.querySelector('#dir_input');
    var filesDiv = document.querySelector('#files');

    fileControl.addEventListener('change', function (event) {
        var files = event.target.files;
        var fileList = [];
        var html = '';
        for (var i = 0, len = files.length; i < len; i++) {
            html += setDiv(files[i])
        }
        filesDiv.innerHTML = html;
    });
});

function CreateTab(title)
{
    this.title=title;
    this.divId= "editor_" + index;
    index++;
    if (index > 100000) {
        index = 1;
    }
    this.hasChange = true;
    this.instant = {};
    this.isNew = true;
}

function addNewTab(title, data, isNew) {
    var tab = new CreateTab(title);
    tab.isNew = isNew;
    var div = "<div id=\""+tab.divId+"\"></div>";
    $("#EditSpace").append(div);
    tab.instant = editormd(tab.divId, {
        syncScrolling : "single",
        toolbarIcons: "simple",
        path    : "editor.md/lib/",
        saveHTMLToTextarea : true,
        emoji: true,//emoji表情，默认关闭
        taskList: true,
        tocm: true, // Using [TOCM]
        tex: true,// 开启科学公式TeX语言支持，默认关闭
        flowChart: true,//开启流程图支持，默认关闭
        sequenceDiagram: true,//开启时序/序列图支持，默认关闭,
        dialogLockScreen : false,//设置弹出层对话框不锁屏，全局通用，默认为true
        dialogShowMask : false,//设置弹出层对话框显示透明遮罩层，全局通用，默认为true
        dialogDraggable : false,//设置弹出层对话框不可拖动，全局通用，默认为true
        dialogMaskOpacity : 0.4, //设置透明遮罩层的透明度，全局通用，默认值为0.1
        dialogMaskBgColor : "#000",//设置透明遮罩层的背景颜色，全局通用，默认为#fff
        codeFold: true,
        editorTheme: "pastel-on-dark",
        theme: "dark",
        previewTheme: "white",
        onload : function() {
            var keyMap = {
                "Ctrl-S": function(cm) {
                    //alert("Ctrl+S");
                    saveFile(true);
                }
            };
            this.addKeyMap(keyMap);
            this.setMarkdown(data);
        },
        onchange : function() {
            //console.log("onchange =>", this, this.id, this.settings, this.state);
            //tab.hasChange = true;
            row=this.getCursor()["line"]+1
            col = this.getCursor()["ch"]+1
            $("#position").html("行:"+row+" 列:"+col);
        }
    });

    tab.divId = "#"+ tab.divId + "";
    AllTabs[tab.title] = tab;
    if (!isNew) {
        tab.hasChange = false;
    }

    if ($('#TabBar').tabs('tabs').length > 1){
        $(curEditor.divId).hide();
    }

    $('#TabBar').tabs('add', {
        title: title,
        content: "",
        closable: true
    });

    curEditor = tab;
    return tab
}

$("#ppt").click(function () {
    if ($("#edit").is(":hidden")) {
        $("#MContainer").hide();
        $("#desktop").hide();
        $("#edit").show();
        //console.log(curEditor);
        var content = curEditor.instant.getHTML();
        //alert(content);
        $("#PreDestop").show();
        $("#PreDestop").html(content);
    } else {
        $("#PreDestop").hide();
        $("#MContainer").show();
        $("#edit").hide();
        $("#desktop").show();
    }
});

$("#filemgr").click(function () {
    if ($("#eye").is(":hidden")) {
        $("#Display").width('85%');
        $("#Display").hide();
        $("#WorkSpace").show();
        $("#eye-slash").hide();
        $("#eye").show();
    } else {
        $("#WorkSpace").hide();
        $("#Display").width('100%');
        $("#eye").hide();
        $("#eye-slash").show();
    }
});

$("#panel").click(function(){

})

function saveFile(auto) {
    var title = curEditor.title;
    if (curEditor.isNew) {
        var input = $("#file-save");
        input.trigger("click");
    }else {
        var data = curEditor.instant.getMarkdown();
        fs.writeFile(title, data, function (err) {
            if (err) {
                alert("保存失败!" + err.message);
            } else {
                if (auto == false) {
                    alert("保存成功!");
                }
                delete AllTabs[curEditor.title];
                curEditor.hasChange = false;
                curEditor.isNew = false;
                curEditor.title = title;
                document.title =  MTitle + " · " + title;
                var tab = $('#TabBar').tabs('getSelected');
                $('#TabBar').tabs('update', {
                    tab: tab,
                    options: {
                        title: title
                    }
                });
                AllTabs[title] = curEditor;
            }
        });
    }
};

$("#file-save").on("change", function () {
    title = this.value;
    var data = curEditor.instant.getMarkdown();
    fs.writeFile(title, data, function (err) {
        if (err) {
            alert("保存失败!" + err.message);
        } else {
            alert("保存成功!");
            delete AllTabs[curEditor.title];
            curEditor.hasChange = false;
            curEditor.isNew = false;
            curEditor.title = title;
            document.title =  MTitle + " · " + title;
            var tab = $('#TabBar').tabs('getSelected');
            $('#TabBar').tabs('update', {
                tab: tab,
                options: {
                    title: title
                }
            });
            AllTabs[title] = curEditor;
        }
    });
    this.value = ""
})

$("#open").click(function () {
    //检查文件是否选择
    console.log("open");
    $('#box-1').hide();
    var input = $("#file-open");
    input.trigger("click");
});

$("#file-open").on("change", function () {
    //alert(this.value);
    if (!this.value) {
        return;
    }
    if (AllTabs[this.value]) {
        $('#TabBar').tabs('select', this.value);
        this.value = "";
        return;
    }
    var filePath = this.value.toString();
    readFile(filePath);
    this.value = ""
});

$("#save").click(function () {
    $('#box-1').hide();
    saveFile(false);
});

$("#new").click(function () {
    $('#box-1').hide();
    addNewTab("new "+index+" *", "", true)
})


$("#expander").mousedown(function (e) {
    var src_posi_X = 0,
        dest_posi_X = 0,
        move_X = 0,
        is_mouse_down = false,
        destWidth = 200;
    src_posi_X = e.pageX;
    is_mouse_down = true;
    $(document).mousemove(function (e) {
        dest_posi_X = e.pageX;
        move_X = src_posi_X - dest_posi_X;
        src_posi_X = dest_posi_X;
        destWidth = $("#WorkSpace").width() + move_X;
        if (is_mouse_down) {
            $("#WorkSpace").width(destWidth > 200 ? destWidth : 200 + 'px');
        }
    }).bind("click mouseup", function (e) {
        if (is_mouse_down) {
            is_mouse_down = false;
        }
    });
});