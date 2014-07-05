{EventEmitter} = require 'events'
Modal = require 'modal.js'
Util = require 'util.js'

lib = 
  $ : jQuery
  JSZip : JSZip
  GIF : GIF
  GIF_worker_URL : GIF_worker_URL
  saveAs : saveAs

class Deferer extends EventEmitter
  constructor: ->
    @count = 0
    @counted = 0
  add: ->
    @count++
  count: ->
    @counted++
    @emit 'progress', 
      all : @count
      fired : @ counted
    if @counted is @count
      @emit 'done'
###
  blobs =
    blob : blob1,
    blob : blob2
###
class imageCreater extends EventEmitter
  constructor : (@Deferer = Deferer, @$ = lib.$) ->
    @locked = false
  create : (blobs) ->
    if @locked is true
      return false
    @locked = true
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
  render: (gifFrames) ->
    if @locked is true
      return false
    @locked = true
    @deferer.removeAllListeners 'done'
    @deferer = null
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
      @gif = null
      @locked = false
    return true

class Downloader extends EventEmitter
  constructor: ()->
    @_cachedURL = []
    @_cache = {}
    @locked = false
  download: (url)->
    if @locked
      return false
    
    if url in @_cachedURL
      @emit 'success', @_cache[url]
      @removeAllListeners 'success'
      return true
    
    @locked = true
    
    @req = new XMLHttpRequest()
    @req.open "GET", src, true
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
    return true

main = (global, $, util)->
  downloader = new Downloader
  
  downloadPicture = (size)->
    switch size
      when 'small'
        url = global.pixiv.context.ugokuIllustData.src
      when 'full'
        url = global.pixiv.context.ugokuIllustFullscreenData.src
      else
        throw new Error 'unknown size'
    downloader.download(url)
    downloader.on 'success', (blob)->
      console.log blob
        
  GM_registerMenuCommand '下載檔案!(縮圖)', ->
    downloadPicture 'small'
  GM_registerMenuCommand '下載檔案!(全圖)', ->
    downloadPicture 'full'

main unsafeWindow, lib.$, Util