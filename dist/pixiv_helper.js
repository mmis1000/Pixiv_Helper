// Generated by CommonJS Everywhere 0.9.7
(function (global) {
  function require(file, parentModule) {
    if ({}.hasOwnProperty.call(require.cache, file))
      return require.cache[file];
    var resolved = require.resolve(file);
    if (!resolved)
      throw new Error('Failed to resolve module ' + file);
    var module$ = {
        id: file,
        require: require,
        filename: file,
        exports: {},
        loaded: false,
        parent: parentModule,
        children: []
      };
    if (parentModule)
      parentModule.children.push(module$);
    var dirname = file.slice(0, file.lastIndexOf('/') + 1);
    require.cache[file] = module$.exports;
    resolved.call(module$.exports, module$, module$.exports, dirname, file);
    module$.loaded = true;
    return require.cache[file] = module$.exports;
  }
  require.modules = {};
  require.cache = {};
  require.resolve = function (file) {
    return {}.hasOwnProperty.call(require.modules, file) ? require.modules[file] : void 0;
  };
  require.define = function (file, fn) {
    require.modules[file] = fn;
  };
  var process = function () {
      var cwd = '/';
      return {
        title: 'browser',
        version: 'v0.10.26',
        browser: true,
        env: {},
        argv: [],
        nextTick: global.setImmediate || function (fn) {
          setTimeout(fn, 0);
        },
        cwd: function () {
          return cwd;
        },
        chdir: function (dir) {
          cwd = dir;
        }
      };
    }();
  require.define('/pixiv_helper.coffee', function (module, exports, __dirname, __filename) {
    var Deferer, Downloader, EventEmitter, Gifcreater, GifFrames, imageCreater, lib, main, Modal, Util;
    EventEmitter = require('events', module).EventEmitter;
    Modal = require('/modal.js', module);
    Util = require('/util.js', module);
    lib = {
      $: jQuery,
      JSZip: JSZip,
      GIF: GIF,
      GIF_worker_URL: GIF_worker_URL,
      saveAs: saveAs
    };
    Deferer = function (super$) {
      extends$(Deferer, super$);
      function Deferer() {
        this.count = 0;
        this.counted = 0;
      }
      Deferer.prototype.add = function () {
        return this.count++;
      };
      Deferer.prototype.count = function () {
        this.counted++;
        this.emit('progress', {
          all: this.count,
          fired: this(counted)
        });
        if (this.counted === this.count)
          return this.emit('done');
      };
      return Deferer;
    }(EventEmitter);
    imageCreater = function (super$1) {
      extends$(imageCreater, super$1);
      function imageCreater(param$, param$1) {
        if (null == param$)
          param$ = Deferer;
        this.Deferer = param$;
        if (null == param$1)
          param$1 = lib.$;
        this.$ = param$1;
        this.locked = false;
      }
      imageCreater.prototype.create = function (blobs) {
        var file, imgElement, imgURL;
        if (this.locked === true)
          return false;
        this.locked = true;
        this.deferer = new this.Deferer;
        for (var i$ = 0, length$ = blobs.length; i$ < length$; ++i$) {
          file = blobs[i$];
          imgURL = Util.getUrl(file.blob);
          imgElement = document.createElement('img');
          imgElement.src = imgURL;
          file.image = imgElement;
          this.deferer.add();
          this.$(imgElement).on('load', function (this$) {
            return function () {
              this$.deferer.count();
              return true;
            };
          }(this));
        }
        this.deferer.on('done', function (this$) {
          return function () {
            this$.emit('done', blobs);
            this$.deferer.removeAllListeners('done');
            this$.deferer = null;
            this$.removeAllListeners('done');
            return true;
          };
        }(this));
        return true;
      };
      return imageCreater;
    }(EventEmitter);
    GifFrames = function () {
      function GifFrames(param$) {
        if (null == param$)
          param$ = [];
        this.frames = param$;
      }
      GifFrames.prototype.add = function (imgElement, delay) {
        this.frames.push({
          image: imgElement,
          delay: delay
        });
        return true;
      };
      return GifFrames;
    }();
    Gifcreater = function (super$2) {
      extends$(Gifcreater, super$2);
      function Gifcreater(param$, param$1) {
        if (null == param$)
          param$ = lib.GIF;
        this.Gif = param$;
        if (null == param$1)
          param$1 = lib.GIF_worker_URL;
        this.Gif_worker_path = param$1;
        this.locked = false;
      }
      Gifcreater.prototype.render = function (gifFrames) {
        var frame;
        if (this.locked === true)
          return false;
        this.locked = true;
        this.deferer.removeAllListeners('done');
        this.deferer = null;
        this.gif = new this.Gif({
          workers: 2,
          quality: 10,
          workerScript: this.Gif_worker_path,
          width: size[0],
          height: size[1]
        });
        for (var i$ = 0, length$ = gifFrames.length; i$ < length$; ++i$) {
          frame = gifFrames[i$];
          this.gif.addFrame(frame.image, { delay: frame.delay });
        }
        this.gif.on('progress', function (this$) {
          return function (p) {
            return this$.emit('progress', p);
          };
        }(this));
        this.gif.on('finished', function (this$) {
          return function (blob) {
            this$.emit('finished', blob);
            try {
              this$.gif.removeAllListeners('finished');
            } catch (e$) {
            }
            try {
              this$.gif.removeAllListeners('progress');
            } catch (e$1) {
            }
            try {
              this$.removeAllListeners('finished');
            } catch (e$2) {
            }
            try {
              this$.gremoveAllListeners('progress');
            } catch (e$3) {
            }
            this$.gif = null;
            return this$.locked = false;
          };
        }(this));
        return true;
      };
      return Gifcreater;
    }(EventEmitter);
    Downloader = function (super$3) {
      extends$(Downloader, super$3);
      function Downloader() {
        this._cachedURL = [];
        this._cache = {};
        this.locked = false;
      }
      Downloader.prototype.download = function (url) {
        if (this.locked)
          return false;
        if (in$(url, this._cachedURL)) {
          this.emit('success', this._cache[url]);
          this.removeAllListeners('success');
          return true;
        }
        this.locked = true;
        this.req = new XMLHttpRequest;
        this.req.open('GET', src, true);
        this.req.responseType = 'blob';
        this.req.onload = function (this$) {
          return function (e) {
            var blob;
            blob = this$.req.response;
            if (null != blob) {
              this$._cachedURL.push(url);
              this$._cache[url] = blob;
              this$.emit('success', blob);
              this$.removeAllListeners('success');
            } else {
              this$.emit('fail', url);
            }
            this$.locked = false;
            return true;
          };
        }(this);
        return true;
      };
      return Downloader;
    }(EventEmitter);
    main = function (global, $, util) {
      var downloader, downloadPicture;
      downloader = new Downloader;
      downloadPicture = function (size) {
        var url;
        switch (size) {
        case 'small':
          url = global.pixiv.context.ugokuIllustData.src;
          break;
        case 'full':
          url = global.pixiv.context.ugokuIllustFullscreenData.src;
          break;
        default:
          throw new Error('unknown size');
        }
        downloader.download(url);
        return downloader.on('success', function (blob) {
          return console.log(blob);
        });
      };
      GM_registerMenuCommand('\u4E0B\u8F09\u6A94\u6848!(\u7E2E\u5716)', function () {
        return downloadPicture('small');
      });
      return GM_registerMenuCommand('\u4E0B\u8F09\u6A94\u6848!(\u5168\u5716)', function () {
        return downloadPicture('full');
      });
    };
    function isOwn$(o, p) {
      return {}.hasOwnProperty.call(o, p);
    }
    function extends$(child, parent) {
      for (var key in parent)
        if (isOwn$(parent, key))
          child[key] = parent[key];
      function ctor() {
        this.constructor = child;
      }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor;
      child.__super__ = parent.prototype;
      return child;
    }
    function in$(member, list) {
      for (var i = 0, length = list.length; i < length; ++i)
        if (i in list && list[i] === member)
          return true;
      return false;
    }
  });
  require.define('/util.js', function (module, exports, __dirname, __filename) {
    var mimeTypes = {
        'a': 'application/octet-stream',
        'ai': 'application/postscript',
        'aif': 'audio/x-aiff',
        'aifc': 'audio/x-aiff',
        'aiff': 'audio/x-aiff',
        'au': 'audio/basic',
        'avi': 'video/x-msvideo',
        'bat': 'text/plain',
        'bin': 'application/octet-stream',
        'bmp': 'image/x-ms-bmp',
        'c': 'text/plain',
        'cdf': 'application/x-cdf',
        'csh': 'application/x-csh',
        'css': 'text/css',
        'dll': 'application/octet-stream',
        'doc': 'application/msword',
        'dot': 'application/msword',
        'dvi': 'application/x-dvi',
        'eml': 'message/rfc822',
        'eps': 'application/postscript',
        'etx': 'text/x-setext',
        'exe': 'application/octet-stream',
        'gif': 'image/gif',
        'gtar': 'application/x-gtar',
        'h': 'text/plain',
        'hdf': 'application/x-hdf',
        'htm': 'text/html',
        'html': 'text/html',
        'jpe': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'js': 'application/x-javascript',
        'ksh': 'text/plain',
        'latex': 'application/x-latex',
        'm1v': 'video/mpeg',
        'man': 'application/x-troff-man',
        'me': 'application/x-troff-me',
        'mht': 'message/rfc822',
        'mhtml': 'message/rfc822',
        'mif': 'application/x-mif',
        'mov': 'video/quicktime',
        'movie': 'video/x-sgi-movie',
        'mp2': 'audio/mpeg',
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4',
        'mpa': 'video/mpeg',
        'mpe': 'video/mpeg',
        'mpeg': 'video/mpeg',
        'mpg': 'video/mpeg',
        'ms': 'application/x-troff-ms',
        'nc': 'application/x-netcdf',
        'nws': 'message/rfc822',
        'o': 'application/octet-stream',
        'obj': 'application/octet-stream',
        'oda': 'application/oda',
        'pbm': 'image/x-portable-bitmap',
        'pdf': 'application/pdf',
        'pfx': 'application/x-pkcs12',
        'pgm': 'image/x-portable-graymap',
        'png': 'image/png',
        'pnm': 'image/x-portable-anymap',
        'pot': 'application/vnd.ms-powerpoint',
        'ppa': 'application/vnd.ms-powerpoint',
        'ppm': 'image/x-portable-pixmap',
        'pps': 'application/vnd.ms-powerpoint',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.ms-powerpoint',
        'ps': 'application/postscript',
        'pwz': 'application/vnd.ms-powerpoint',
        'py': 'text/x-python',
        'pyc': 'application/x-python-code',
        'pyo': 'application/x-python-code',
        'qt': 'video/quicktime',
        'ra': 'audio/x-pn-realaudio',
        'ram': 'application/x-pn-realaudio',
        'ras': 'image/x-cmu-raster',
        'rdf': 'application/xml',
        'rgb': 'image/x-rgb',
        'roff': 'application/x-troff',
        'rtx': 'text/richtext',
        'sgm': 'text/x-sgml',
        'sgml': 'text/x-sgml',
        'sh': 'application/x-sh',
        'shar': 'application/x-shar',
        'snd': 'audio/basic',
        'so': 'application/octet-stream',
        'src': 'application/x-wais-source',
        'swf': 'application/x-shockwave-flash',
        't': 'application/x-troff',
        'tar': 'application/x-tar',
        'tcl': 'application/x-tcl',
        'tex': 'application/x-tex',
        'texi': 'application/x-texinfo',
        'texinfo': 'application/x-texinfo',
        'tif': 'image/tiff',
        'tiff': 'image/tiff',
        'tr': 'application/x-troff',
        'tsv': 'text/tab-separated-values',
        'txt': 'text/plain',
        'ustar': 'application/x-ustar',
        'vcf': 'text/x-vcard',
        'wav': 'audio/x-wav',
        'wiz': 'application/msword',
        'wsdl': 'application/xml',
        'xbm': 'image/x-xbitmap',
        'xlb': 'application/vnd.ms-excel',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.ms-excel',
        'xml': 'text/xml',
        'xpdl': 'application/xml',
        'xpm': 'image/x-xpixmap',
        'xsl': 'application/xml',
        'xwd': 'image/x-xwindowdump',
        'zip': 'application/zip'
      };
    function getMIME(name) {
      return mimeTypes[getFileExtension(name)] || '';
    }
    function getFileExtension(name) {
      return last(name.split('.'));
    }
    function getUrl(blob, name) {
      return URL.createObjectURL(blob);
    }
    module.exports = {
      getMIME: getMIME,
      getFileExtension: getFileExtension,
      getUrl: getUrl
    };
  });
  require.define('/modal.js', function (module, exports, __dirname, __filename) {
    var loadPlugin = function ($) {
      var defaultOption = { stat: 'on' };
      function off(el) {
        el = $(el);
        el.find('.modal').slideUp(500, function () {
          el.fadeOut(200);
        });
      }
      function on(el) {
        el = $(el);
        el.find('.modal').hide();
        el.fadeIn(200, function () {
          el.find('.modal').slideDown(500);
        });
      }
      $.fn.modal = function modal(option) {
        option = option || {};
        $.extend(option, defaultOption);
        var _modal = $(this);
        if (!_modal.is('.inited')) {
          _modal.on('click', function (e) {
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
        case 'on':
          on(_modal);
          break;
        case 'off':
          off(_modal);
          break;
        default:
          on(_modal);
        }
      };
    };
    var modal_css = '.mmis1000-modal{background:rgba(128,128,128,0.5);bottom:0;display:none;left:0;overflow:hidden;position:fixed;right:0;top:0;z-index:99999}' + '.mmis1000-modal .modal{background:#fff;border-radius:10px;bottom:25px;left:25px;position:absolute;right:25px;top:25px}' + '.mmis1000-modal .modal .head{border-bottom-color:#ddd;border-bottom-style:solid;border-bottom-width:2px;height:30px;left:0;padding-left:5px;position:absolute;right:0;top:0}' + '.mmis1000-modal .modal .head .text{color:#666;font-size:20px;line-height:30px}' + '.mmis1000-modal .modal .head .exit{background:red;border-radius:4px;color:#fff;cursor:pointer;font-size:20px;height:20px;line-height:20px;position:absolute;right:5px;text-align:center;top:5px;width:20px}' + '.mmis1000-modal .modal .content-wrapper{bottom:10px;left:0;overflow:auto;position:absolute;right:0;top:32px}' + '.mmis1000-modal .modal .content-wrapper .content{font-size:18px;left:10px;position:absolute;right:10px;text-align:center;top:10px}' + '.mmis1000-modal .modal .content-wrapper .content img{max-width:100%}';
    var modalContent = [
        "<div id='test' class='mmis1000-modal'>",
        "<div class='modal'>",
        "<div class='head'>",
        "<span class='text'>\uFFFDj\uFFFD\uFFFD\uFFFD\u02F5\uFFFD</span>",
        "<div class='exit'>",
        'X',
        '</div>',
        '</div>',
        "<div class='content-wrapper'>",
        "<div class='content'>",
        '</div>',
        '</div>',
        '</div>',
        '</div>'
      ].join('');
    var modal = {
        hook: function ($) {
          if (this.$) {
            return;
          }
          this.$ = $;
          loadPlugin($);
          $('head').append($('<style></style>').html(modal_css));
          this.modal = $(modalContent);
          this.modalContent = this.modal.find('.content');
          $('body').append(this.modal);
        },
        show: function () {
          this.$(this.modal).modal();
        },
        hide: function () {
          this.$(this.modal).modal({ stat: off });
        },
        clear: function () {
          this.modalContent.find('*').remove();
          this.modalContent.text('');
        }
      };
    module.exports = modal;
  });
  require.define('events', function (module, exports, __dirname, __filename) {
    if (!process.EventEmitter)
      process.EventEmitter = function () {
      };
    var EventEmitter = exports.EventEmitter = process.EventEmitter;
    var isArray = typeof Array.isArray === 'function' ? Array.isArray : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]';
      };
    var defaultMaxListeners = 10;
    EventEmitter.prototype.setMaxListeners = function (n) {
      if (!this._events)
        this._events = {};
      this._events.maxListeners = n;
    };
    EventEmitter.prototype.emit = function (type) {
      if (type === 'error') {
        if (!this._events || !this._events.error || isArray(this._events.error) && !this._events.error.length) {
          if (arguments[1] instanceof Error) {
            throw arguments[1];
          } else {
            throw new Error("Uncaught, unspecified 'error' event.");
          }
          return false;
        }
      }
      if (!this._events)
        return false;
      var handler = this._events[type];
      if (!handler)
        return false;
      if (typeof handler == 'function') {
        switch (arguments.length) {
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        default:
          var args = Array.prototype.slice.call(arguments, 1);
          handler.apply(this, args);
        }
        return true;
      } else if (isArray(handler)) {
        var args = Array.prototype.slice.call(arguments, 1);
        var listeners = handler.slice();
        for (var i = 0, l = listeners.length; i < l; i++) {
          listeners[i].apply(this, args);
        }
        return true;
      } else {
        return false;
      }
    };
    EventEmitter.prototype.addListener = function (type, listener) {
      if ('function' !== typeof listener) {
        throw new Error('addListener only takes instances of Function');
      }
      if (!this._events)
        this._events = {};
      this.emit('newListener', type, listener);
      if (!this._events[type]) {
        this._events[type] = listener;
      } else if (isArray(this._events[type])) {
        if (!this._events[type].warned) {
          var m;
          if (this._events.maxListeners !== undefined) {
            m = this._events.maxListeners;
          } else {
            m = defaultMaxListeners;
          }
          if (m && m > 0 && this._events[type].length > m) {
            this._events[type].warned = true;
            console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
            console.trace();
          }
        }
        this._events[type].push(listener);
      } else {
        this._events[type] = [
          this._events[type],
          listener
        ];
      }
      return this;
    };
    EventEmitter.prototype.on = EventEmitter.prototype.addListener;
    EventEmitter.prototype.once = function (type, listener) {
      var self = this;
      self.on(type, function g() {
        self.removeListener(type, g);
        listener.apply(this, arguments);
      });
      return this;
    };
    EventEmitter.prototype.removeListener = function (type, listener) {
      if ('function' !== typeof listener) {
        throw new Error('removeListener only takes instances of Function');
      }
      if (!this._events || !this._events[type])
        return this;
      var list = this._events[type];
      if (isArray(list)) {
        var i = list.indexOf(listener);
        if (i < 0)
          return this;
        list.splice(i, 1);
        if (list.length == 0)
          delete this._events[type];
      } else if (this._events[type] === listener) {
        delete this._events[type];
      }
      return this;
    };
    EventEmitter.prototype.removeAllListeners = function (type) {
      if (type && this._events && this._events[type])
        this._events[type] = null;
      return this;
    };
    EventEmitter.prototype.listeners = function (type) {
      if (!this._events)
        this._events = {};
      if (!this._events[type])
        this._events[type] = [];
      if (!isArray(this._events[type])) {
        this._events[type] = [this._events[type]];
      }
      return this._events[type];
    };
  });
  global.pixiv_helper = require('/pixiv_helper.coffee');
}.call(this, this));
//# sourceMappingURL=pixiv_helper.js.map 
// pixiv_helper.js   
