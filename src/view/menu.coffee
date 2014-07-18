{EventEmitter} = require 'events'

menuHTML = '''
    <div class="mmis_selection_box">
        <form>
            <fieldset>
                <legend>尺寸</legend>
                <input id="size_mini" type="radio" name ="size" value ="mini" checked>
                <label for="size_mini">縮圖</label>
                <input id="size_full" type="radio" name ="size" value ="full">
                <label for="size_full">全圖</label>
            </fieldset>
            <fieldset>
                <legend>格式</legend>
                <input id="type_frame" type="radio" name ="type" value ="frame" checked>
                <label for="type_frame">單格</label>
                <input id="type_gif" type="radio" name ="type" value ="gif">
                <label for="type_gif">gif</label>
            </fieldset>
            <fieldset>
                <legend>動作</legend>
                <input id="action_download" type="radio" name ="action" value ="download" checked>
                <label for="action_download">下載</label>
                <input id="action_view" type="radio" name ="action" value ="view">
                <label for="action_view">瀏覽</label>
            </fieldset>
        </form>
        <div class="botton_wrap">
            <button data-action="run">
                執行
            </button>
            <button data-action="cancel">
                取消
            </button>
        </div>
    </div>
'''
menuCss = '''
  .mmis_selection_box {
    display :none;
    z-index: 99999;
    width: 200px;
    height: 280px;
    border: 5px solid #eeeeee;
    border-radius: 10px;
    background: white;
    position: fixed;
    text-align: center;
    left: 50%;
    top: 50%;
    font-size: 18px;
    margin: -145px 0px 0px -105px;
    line-height: 25px;
  }
  .mmis_selection_box fieldset,
  .mmis_selection_box input,
  .mmis_selection_box buttom,
  .mmis_selection_box div {
    margin: 0px;
    border: 0px;
    padding: 0px;
  }
  .mmis_selection_box fieldset {
    margin: 0.5em;
    padding: 0.5em;
    border: 1px solid #dddddd;
    border-radius: 10px;
  }
  .mmis_selection_box fieldset label {
    display: inline-block;
    width: 3em;
    cursor: pointer;
  }
  .mmis_selection_box .botton_wrap {
    margin: 0.5em;
  }
  .mmis_selection_box .botton_wrap button {
    display: block;
    width: 50%;
    text-align: center;
    float: left;
  }
'''
class menu extends EventEmitter
  constructor: ->
    @$ = null
    @inited = false
  hook: (jQuery)->
    if @inited
      return false
    @$ = jQuery
    @inited = true
    (@$ 'head').append (($ '<style>').text menuCss)
    @menu = $ menuHTML
    (@$ 'body').append @menu
    
    @menu.on 'click', 'button[data-action="cancel"]',(e)=>
      @hide()
      return true
    @menu.on 'click', 'button[data-action="run"]',(e)=>
      @hide()
      data = 
        size : (@menu.find 'input[name="size"]:checked').val()
        type : (@menu.find 'input[name="type"]:checked').val()
        action : (@menu.find 'input[name="action"]:checked').val()
      @emit 'run', data
      return true
    return true
  show: ()->
    if not @inited
      return false
    @menu.fadeIn()
    return true
  hide: ()->
    if not @inited
      return false
    @menu.fadeOut()
    return true

module.exports = new menu