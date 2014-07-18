
var loadPlugin = function($){
    var defaultOption = {
        stat : 'on'
    };
    function off(el) {
        el = $(el);
        el.find('.modal').slideUp(500,function(){
            el.fadeOut(200);
        });
    }
    function on(el) {
        el = $(el);
        el.find('.modal').hide();
        el.fadeIn(200,function(){
            el.find('.modal').slideDown(500);
        });
    }
    $.fn.modal = function modal(option) {
        option = option || {};
        $.extend(option, defaultOption);
        var _modal = $(this);
        if (!_modal.is('.inited')) {
            _modal.on('click', function(e){
                if ($(e.target).is('.mmis1000-modal .exit')) {
                    off(_modal);
                }
                if ($(e.target).is('.mmis1000-modal')) {
                    off(_modal);
                }
            });
            _modal.addClass('inited');
        }
        switch (option.stat) {
            case "on":
                on(_modal);
                break;
            case "off":
                off(_modal);
                break;
            default:
                on(_modal);
        }
    };
};

var modal_css = ".mmis1000-modal{background:rgba(128,128,128,0.5);bottom:0;display:none;left:0;overflow:hidden;position:fixed;right:0;top:0;z-index:99999}"+
    ".mmis1000-modal .modal{background:#fff;border-radius:10px;bottom:25px;left:25px;position:absolute;right:25px;top:25px}"+
    ".mmis1000-modal .modal .head{border-bottom-color:#ddd;border-bottom-style:solid;border-bottom-width:2px;height:30px;left:0;padding-left:5px;position:absolute;right:0;top:0}"+
    ".mmis1000-modal .modal .head .text{color:#666;font-size:20px;line-height:30px}"+
    ".mmis1000-modal .modal .head .exit{background:red;border-radius:4px;color:#fff;cursor:pointer;font-size:20px;height:20px;line-height:20px;position:absolute;right:5px;text-align:center;top:5px;width:20px}"+
    ".mmis1000-modal .modal .content-wrapper{bottom:10px;left:0;overflow:auto;position:absolute;right:0;top:32px}"+
    ".mmis1000-modal .modal .content-wrapper .content{font-size:18px;left:10px;position:absolute;right:10px;text-align:center;top:10px}"+
    ".mmis1000-modal .modal .content-wrapper .content img{max-width:100%}";

var modalContent = [
    "<div id='test' class='mmis1000-modal'>",
    "<div class='modal'>",
    "<div class='head'>",
    "<span class='text'>檢視</span>",
    "<div class='exit'>",
    "X",
    "</div>",
    "</div>",
    "<div class='content-wrapper'>",
    "<div class='content'>",
    "</div>",
    "</div>",
    "</div>",
    "</div>"
].join('');

var modal = {
  hook : function($) {
    if (this.$) {return;}
    this.$ = $;
    loadPlugin($);
    $('head').append($('<style></style>').html(modal_css));
    this.modal = $(modalContent);
    this.modalContent = this.modal.find('.content')
    $('body').append(this.modal);
  },
  show : function() {
    this.$(this.modal).modal();
  },
  hide : function() {
    this.$(this.modal).modal({stat : off});
  },
  clear : function() {
    /*ensure all element on it destructed correctly*/
    this.modalContent.find('*').remove();
    this.modalContent.text('');
  }
}

module.exports = modal;