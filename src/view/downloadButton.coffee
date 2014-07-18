{EventEmitter} = require 'events'

buttonHTML = '''
  <button class="mmis-botton" title="下載"></button>
'''

buttonCss = '''
  .wrapper .mmis-botton {
    position: absolute;
    right: 42px;
    top: 5px;
    background: rgba(153, 153, 153, 0.5);
    color: #f9f9f9;
    box-sizing: content-box;
    border: 0px;
    padding: 6px 6px 6px 6px;
    margin: 0px;
    width: 20px;
    height: 20px;
    border-radius: 5px;
    line-height: 20px;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    -webkit-transition: background-color, opacity 0.2s;
    -moz-transition: background-color, opacity 0.2s;
    -o-transition: background-color, opacity 0.2s;
    -ms-transition: background-color, opacity 0.2s;
    transition: background-color, opacity 0.2s;
    opacity: 0;
    display: block;
  }
  .wrapper .mmis-botton:hover {
    background-color: rgba(153,153,153,0.75);
  }
  
  .wrapper .mmis-botton::after {
    content: "↓";
    display: inline;
  }
  ._ugoku-illust-player-container:hover .mmis-botton {
    opacity: 1;
  }
'''

class botton extends EventEmitter
  constructor: ->
    @$ = null
    @inited = false
  hook: (jQuery)->
    if @inited
      return false
    @$ = jQuery
    @inited = true
    
    (@$ 'head').append (@$ '<style>').html  buttonCss
    @button = $ buttonHTML
    
    (@$ '.works_display>._ugoku-illust-player-container>.wrapper').append @button
    
    @button.on 'click', =>
      @emit 'click'

module.exports = new botton