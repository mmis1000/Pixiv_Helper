{EventEmitter} = require 'events'
Modal = require 'view/modal.js'
Menu = require 'view/menu.coffee'
Button = require 'view/downloadButton.coffee'
Util = require 'util.js'

lib = 
  $ : jQuery
  JSZip : JSZip
  GIF : GIF
  GIF_worker_URL : GIF_worker_URL
  saveAs : saveAs

class Deferer extends EventEmitter
  constructor: ->
    @all = 0
    @counted = 0
  add: ->
    @all++
  count: ->
    @counted++
    @emit 'progress', 
      all : @all
      fired : @counted
    if @counted is @all
      @emit 'done'
###
  blobs =
    blob : blob1,
    blob : blob2
###
class ImageCreater extends EventEmitter
  constructor : (@Deferer = Deferer, @$ = lib.$) ->
    @locked = false
  create : (blobs) ->
    if @locked is true
      console.log 'incorrect invoke'
      return false
    @locked = true
    console.log 'image create start'
    @deferer = new @Deferer
    for file in blobs
      imgURL = Util.getUrl(file.blob)
      imgElement =  document.createElement "img"
      imgElement.src = imgURL
      file.image = imgElement
      @deferer.add()
      (@$ imgElement).on 'load', =>
        @deferer.count()
        return true
      
    @deferer.on 'done', =>
      @emit 'done', blobs
      @deferer.removeAllListeners 'done'
      @deferer = null
      @removeAllListeners 'done'
      @locked = false
      return true
    return true
class GifFrames
  constructor : (@frames = []) ->
  add : (imgElement, delay) ->
    @frames.push
      image : imgElement
      delay : delay
    return true

###
  gifFrames =
    image : image1
    delay : delay1,
    image : image2
    delay : delay2,
###
class Gifcreater extends EventEmitter
  constructor: (@Gif = lib.GIF, @Gif_worker_path = lib.GIF_worker_URL) ->
    @locked = false 
    @cachedFrames = []
    @cachedGif = []
  render: (gifFrames, size) ->
    if @locked is true
      console.log 'incorrect invoke'
      return false
      
    index = @cachedFrames.indexOf gifFrames
    if index >= 0
      @emit 'finished', @cachedGif[index]
      @removeAllListeners 'finished'
      return true
    
    @locked = true
    console.log 'Gif create start'
    @gif = new @Gif
      workers : 2
      quality : 10
      workerScript : @Gif_worker_path
      width : size[0]
      height : size[1]
    for frame in gifFrames
      @gif.addFrame frame.image,
        delay: frame.delay
    @gif.on 'progress', (p)=>
      @emit 'progress', p
    @gif.on 'finished', (blob)=>
      @emit 'finished', blob
      # prevent memory leak
      try @gif.removeAllListeners 'finished'
      try @gif.removeAllListeners 'progress'
      try @removeAllListeners 'finished'
      try @gremoveAllListeners 'progress'
      @cachedFrames.push gifFrames
      @cachedGif.push blob
      @gif = null
      @locked = false
    @gif.render()
    return true

class Extracter extends EventEmitter
  constructor: (@JSZip = lib.JSZip)->
    @locked = false
    @zippedFiles = []
    @unzippedFiles = []
  extract: (@blob)->
    if @locked is true
      console.log 'incorrect invoke'
      return false
    
    console.log 'extract start'
    index = @zippedFiles.indexOf @blob
    if index >= 0
      console.log "emit #{@emit 'done', @unzippedFiles[index]}"
      @removeAllListeners 'done'
      return true
    
    @locked = true
    @fileReader = new FileReader
    @fileReader.onload = ()=>
      @_onArrayBufferLoaded @fileReader.result
    @fileReader.readAsArrayBuffer @blob
    
  _onArrayBufferLoaded: (arrBuffer)->
    @zip = new @JSZip arrBuffer
    files = @zip.file /\d+.(?:jpg|png|gif)/i
    temp = []
    for file in files
      if file.dir
        break
      fileName = file.name
      MIME = Util.getMIME fileName
      arrayBuffer_file = file.asArrayBuffer()
      blob = new Blob [arrayBuffer_file],
        type : MIME
      temp.push
        blob : blob
        fileName : fileName
        mime : MIME
        
    @zippedFiles.push @blob
    @unzippedFiles.push temp
    
    console.log "emit #{@emit 'done', temp}"
    
    @blob = null
    @removeAllListeners 'done'
    @zip = null
    @fileReader = null
    @locked = false
    return true

class Downloader extends EventEmitter
  constructor: ()->
    @_cachedURL = []
    @_cache = {}
    @locked = false
  download: (url)->
    if @locked
      console.log 'incorrect invoke'
      return false
    
    if url in @_cachedURL
      @emit 'success', @_cache[url]
      @removeAllListeners 'success'
      return true
    
    @locked = true
    
    console.log 'download start'
    @req = new XMLHttpRequest()
    @req.open "GET", url, true
    @req.responseType = "blob"
    @req.onload = (e)=>
      blob = @req.response
      if blob?
        @_cachedURL.push url
        @_cache[url] = blob
        @emit 'success', blob
        @removeAllListeners 'success'
      else
        @emit 'fail', url
      @locked = false
      return true
    @req.send null
    return true

main = (global, $, util, saveAs)->
  Modal.hook $
  Menu.hook $
  downloader = new Downloader
  extracter = new Extracter
  imageCreater = new ImageCreater
  gifCreater = new Gifcreater
  getTitle = ()->
    return global.pixiv.context.illustTitle
  downloadPicture = (size)->
    title = getTitle()
    switch size
      when 'small'
        url = global.pixiv.context.ugokuIllustData.src
      when 'full'
        url = global.pixiv.context.ugokuIllustFullscreenData.src
      else
        throw new Error 'unknown size'
    downloader.on 'success', (blob)->
      console.log blob
      saveAs blob, "#{title}.zip"
    console.log downloader.download url
  
  showPic = (size)->
    title = getTitle()
    switch size
      when 'small'
        url = global.pixiv.context.ugokuIllustData.src
      when 'full'
        url = global.pixiv.context.ugokuIllustFullscreenData.src
      else
        throw new Error 'unknown size'
    downloader.on 'success', (blob)->
      Modal.clear()
      Modal.show()
      extracter.on 'done', (files)->
        imageCreater.on 'done', (files)->
          Modal.clear()
          for file in files
            Modal.modalContent.append ($ '<p></p>').text file.fileName
            Modal.modalContent.append file.image
          return true
        imageCreater.create files
        return true
      extracter.extract blob
      return true
    console.log downloader.download url
    return true
    
  showGif = (size, useDownload)->
    title = getTitle()
    delays = global.pixiv.context.ugokuIllustData.frames.slice 0
    switch size
      when 'small'
        url = global.pixiv.context.ugokuIllustData.src
        imageSize = global.pixiv.context.ugokuIllustData.size.slice 0
      when 'full'
        url = global.pixiv.context.ugokuIllustFullscreenData.src
        imageSize = global.pixiv.context.illustSize.slice 0
      else
        throw new Error 'unknown size'
    downloader.on 'success', (blob)->
      if not useDownload
        Modal.clear()
        Modal.show()
      extracter.on 'done', (files)->
        console.log 'extract done'
        imageCreater.on 'done', (files)->
          imageSize = [
            files[0].image.clientWidth || files[0].image.width,
            files[0].image.clientHeight || files[0].image.height
          ];
          Modal.clear()
          for file in files
            for delay in delays
              if file.fileName is delay.file
                file.delay = delay.delay
                break
          console.log files
          console.log delays
          if not useDownload
            gifCreater.on 'finished' , (blob)->
              Modal.clear()
              url = Util.getUrl blob
              img = document.createElement "img"
              img.src = url
              Modal.modalContent.append img
              return true
            gifCreater.on 'progress' , (p)->
              Modal.modalContent.html "progressing<br>#{Math.floor (p * 100)}%"
              return true
          else
            gifCreater.on 'finished' , (blob)->
              saveAs blob, "#{title}.gif"
              return true
          gifCreater.render files, imageSize
          return true
        imageCreater.create files
        return true
      console.log extracter
      extracter.extract blob
      return true
    console.log downloader.download url
    return true
    
  if global.pixiv.context.ugokuIllustData
    GM_registerMenuCommand '下載動圖', ->
      Menu.show()
      
    Button.hook $
    Button.on 'click', ->
      Menu.show()
  ###
    GM_registerMenuCommand '下載zip檔案!(縮圖)', ->
      downloadPicture 'small'
    GM_registerMenuCommand '檢視影格!(縮圖)', ->
      showPic 'small'
    GM_registerMenuCommand '檢視GIF!(縮圖)', ->
      showGif 'small'
    if global.pixiv.context.ugokuIllustFullscreenData
      GM_registerMenuCommand '下載zip檔案!(全圖)', ->
        downloadPicture 'full'
      GM_registerMenuCommand '檢視影格!(全圖)', ->
        showPic 'full'
      GM_registerMenuCommand '檢視GIF!(全圖)', ->
        showGif 'full'
  ###
  
  Menu.on 'run', (data)->
    #alert JSON.stringify data
    switch data.size
      when 'mini'
        switch data.type
          when 'gif'
            switch data.action
              when 'download'
                showGif 'small', true
              when 'view'
                showGif 'small'
          when 'frame'
            switch data.action
              when 'download'
                downloadPicture 'small'
              when 'view'
                showPic 'small'
      when 'full'
        if not global.pixiv.context.ugokuIllustFullscreenData
          alert '未登入是無法下載全圖的歐'
          return true
        switch data.type
          when 'gif'
            switch data.action
              when 'download'
                showGif 'full', true
              when 'view'
                showGif 'full'
          when 'frame'
            switch data.action
              when 'download'
                downloadPicture 'full'
              when 'view'
                showPic 'full'
  #console.log Menu.show()
  #console.log Menu
console.log lib
main unsafeWindow, lib.$, Util, lib.saveAs