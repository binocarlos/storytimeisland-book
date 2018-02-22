// this is the stub

var $ = require('jquery');

var PageTurner = require('pageturner');
var Platform = require('storytimeisland-platform');
var MediaLib = require('storytimeisland-media');
var Dictionary = require('storytimeisland-dictionary');
var TextHighlighter = require('storytimeisland-texthighlighter');
var Gallery = require('storytimeisland-gallery');
var template = require('./template');

/*

 

*/
module.exports = function storytimeisland_book(options){

 
  /*
  
    SETTINGS
    
  */
  var base_selector = options.selector || '#bookviewer';
  var touch_selector = options.touch_selector || base_selector;

  var container = $(base_selector);

  container.html(template);

  var holderselector = base_selector + ' .storytimeisland_book';
  var bookselector = base_selector + ' #book';
  var shadowselector = base_selector + ' #shadow';
  var lastpageselector = base_selector + ' #lastpage';

  var bookdata = options.data || {};
  var bookconfig = bookdata.config;
  var apply_pageclass = options.apply_pageclass || 'bookpage';

  var dictionary_active = options.dictionary;
  var perspective = options.perspective || 950;
  
  var platform = Platform(options);
  var is_phonegap = platform.is_phonegap;

  var active = false;

  var startpage = bookconfig.test_page || 0;

  var currentindex = -1;
  var shadowloaded = false;
  var rendered = false;

  /*
  
    STATE
    
  */
  var activedictionary = null;
  var activehighlighter = null;

  var currentsize = {};
  var currentpos = {};

  /*
  
    ELEM
    
  */
  var holderelem = $(holderselector);
  var bookelem = $(bookselector);
  var shadowelem = $(shadowselector);
  var lastpageelem = $(lastpageselector);
  var touchelem = $(touch_selector);
  lastpageelem.html(options.lastpagehtml || '');
  
  /*
  
    HTML SOURCE
    
  */
  var html = bookdata.pages.map(function(page, index){

    var no = index + 1;
    var text = (page.text || '').replace(/\n/g, "<br />");

    var offset = page.extra_config.textoffset || {};
    var offsetleft = offset.x || 0;

    if(index==0){
      text = '';
    }

    var elemhtml = [
      '<div class="page">',
      '  <div class="pagebg pagebg' + no + '">',
      '    <div class="pagetext" style="text-align:' + page.alignment + ';">' + text + '</div>',
      '  </div>',
      '</div>'
    ].join("\n");

    return elemhtml;

  })

  // inject the HTML
  bookelem.html(html.join("\n"));

  var pagecount = bookelem.find('.page').length;

  // then create the pageturner
  var book = new PageTurner({
    has3d:options.allow3d,
    bookselector:bookselector,
    pageselector:'.page',
    apply_pageclass:'bookpage',
    startpage:startpage,
    perspective:perspective
  })

  var gallery = Gallery({
    pages:bookdata.pages,
    append_to:container
  });


  book.loading = false;
  book.dragging = false;
  book.animating = false;

  book.pagecount = pagecount;

  var media = MediaLib(bookdata);

  var loading_status = {};

  media.on('loaded:sounds', function(){
    loading_status.sounds = true;
  })

  var images_loaded = 0;

  media.on('loaded:image', function(src, index){
    //loading_status.images = true;
    images_loaded++;
    gallery.enable_page(index);

    if(images_loaded==5){
      book.emit('media:loaded');
    }
  })

  /*
  
    HELPER FUNCTIONS
    
  */
  function get_page_data(forpage){
    return bookdata.pages[arguments.length>0 ? forpage : book.currentpage];
  }

  function get_current_page(){
    return book.currentpage || startpage;
  }

  function shadow_offset(forpage){
    return (forpage==0 ? 1 : 0) * (currentsize.width/2);
  }

  function shadow_width(forpage){
    if(forpage==0 || forpage==pagecount-1){
      return currentsize.width/2 + (forpage==pagecount-1 ? (currentsize.width*0.025) : 0);
    }
    else{
      return currentsize.width;
    }
  }

  function apply_shadow(forpage){
    shadowelem.css({
      'margin-left':shadow_offset(forpage)
    }).width(shadow_width(forpage))
  }

  function taparrow(direction){
    if(book.animating || book.loading){
      book.triggernext = function(){
        book.animate_direction(direction);
      }
      return;
    }
    else{
      book.animate_direction(direction);
    }
  }


  /*
  
    GALLERY
    
  */

  gallery.$elem.hide();

  function open_gallery(){
    gallery.$elem.fadeIn();
    setTimeout(function(){
      gallery.active = true;
      book.emit('gallery:open');
    }, 10)
  }

  function close_gallery(){
    gallery.$elem.fadeOut();
    setTimeout(function(){
      gallery.active = false;
      book.emit('gallery:close');
    }, 10)
  }

  gallery.on('loadpage', function(index){
    close_gallery();
    if(index==0){
      apply_shadow(0);
    }
    else if(index==pagecount-1){
      apply_shadow(pagecount-1);
    }
    lastpageelem.hide();
    book.animate_index(index);
  })


  /*
  
    INSTANCE EVENTS
    
  */
  book.load = function(options){
    media.load(options);
  }

  book.goleft = function(){
    taparrow(-1);
  }

  book.goright = function(){
    taparrow(1); 
  }

  book.activate = function(){
    active = true;
    media.stopsounds();

    book.emit('resize', {
      width:bookelem.width(),
      height:bookelem.height()
    })

    setTimeout(function(){
      shadowelem.css({
        opacity:1
      })
      shadowloaded = true;
    }, 10)
  }

  book.togglegallery = function(){
    if(gallery.active){
      close_gallery();
    }
    else{
      open_gallery(); 
    }
  }

  book.resetgallery = function(){
    gallery.active = false;
    gallery.$elem.fadeOut();
  }


  /*
  
    SIZING
    
  */
  var shadowtimeout = null;

  $(window).on('resize', function(){
    /*
    shadowelem.css({
      opacity:0
    });*/

    /*
    holderelem.css({
      opacity:0
    })
  
    clearTimeout(shadowtimeout);
    shadowtimeout = setTimeout(function(){
      shadowelem.css({
        opacity:1
      });
    }, 100)
    
    if(activedictionary){
      activedictionary.reset();
    }

    if(activehighlighter){
      activehighlighter.reset();
    }*/
    
  })

  var lastsize = null;

  book.on('resize', function(newsize){

    if(!newsize){
      newsize = lastsize;
    }

    lastsize = newsize;
    
    if(activedictionary){
      activedictionary.reset();
    }

    if(activehighlighter){
      activehighlighter.reset();
    }

    holderelem.css({
      opacity:0
    })

    if(activedictionary){
      activedictionary.reset();
    }

    if(activehighlighter){
      activehighlighter.reset();
    }

    setTimeout(function(){
      currentsize = newsize;

      // sort out the shifting of dictionary in books > 2048 wide
      if(!bookdata.config._calculated){
        bookdata.config.realwidth = bookdata.config.width;
        bookdata.config.width = 2048;
        bookdata.config._calculated = true;
      }

      currentsize.ratio = currentsize.width / bookdata.config.width;
      currentsize.dictionary_offset = (bookdata.config.realwidth - bookdata.config.width)/2;

      var windowsize = {
        width:$(window).width(),
        height:$(window).height()
      }

      var xpos = windowsize.width/2 - newsize.width/2;

      var ypos = windowsize.height/2 - newsize.height/2;

      currentpos = {
        x:xpos,
        y:ypos
      }  

      lastpageelem.css({
        //left:xpos + 'px',
        'margin-left':(currentsize.width/2) + 'px',
        top:ypos + 'px'
      })

      lastpageelem.width(currentsize.width/2).height(currentsize.height);
    
      shadowelem.css({
        //left:currentpos.x + 'px',
        //top:currentpos.y + 'px',
        'margin-left':shadow_offset(get_current_page())
      }).height(newsize.height).width(shadow_width(get_current_page()))
    

      holderelem.css({
        left:currentpos.x + 'px',
        top:currentpos.y + 'px'        
      })

      book.load_page(book.currentpage);

      setTimeout(function(){
        holderelem.hide();
        holderelem.css({
          opacity:1
        })
        holderelem.fadeIn();
      }, 500);

    }, 10)

  })


  book.on('loaded', function(index){

    book.loading = false;

    if(shadowloaded){
      shadowelem.css({
        display:'block'
      })  
    }
    
    if(dictionary_active){
      var pagedata = get_page_data(index) || {};

      activedictionary = Dictionary(pagedata, currentpos, currentsize);

      activedictionary.on('sound', function(mp3){
        media.playdictionarysound(mp3);
      })

      activedictionary.on('hint', function(entry, pos){
        var popup = $('<div class="dictionaryhint"><img src="build/storytimeislandbook/img/arrow.png" width=100 /></div>');

        popup.css({
          left:pos.x + 'px',
          top:pos.y + 'px'
        })

        $('body').append(popup);

        setTimeout(function(){
          popup.remove();
        }, 2000);
      })
    }

    function playpage(){
      if(options.play_speech() && index>0){
        var html_string = html[index];
        activehighlighter = TextHighlighter(html_string, bookdata.config.highlighters ? bookdata.config.highlighters[index] : []);

        activehighlighter.elem.css({
          position:'absolute',
        //  left:bookelem.offset().left + 'px',
        //  top:bookelem.offset().top + 'px'
        })

        if(index!=currentindex){
          activehighlighter.start();  
        }
        bookelem.append(activehighlighter.elem);
        activehighlighter.elem.width(currentsize.width).height(currentsize.height);
      }

      if(book.triggernext){
        book.triggernext();
        book.triggernext = null;
      }
      else if(index!=currentindex){
        book.emit('view:page', index);
      }

      gallery.set_current_page(index);

      currentindex = index;
    }
    

    if(index==1 && !dictionaryhint && activedictionary){

      book._cancelhint = false;
      activedictionary.render_index(0, true);

      setTimeout(function(){
        if(book._cancelhint){
          return;
        }
        activedictionary.render_index(1, true);
      }, 500)

      setTimeout(function(){
        if(book._cancelhint){
          return;
        }
        activedictionary.render_index(2, true);
      }, 1000)

      setTimeout(function(){
        if(book._cancelhint){
          return;
        }
        playpage();
      }, 3000)

      dictionaryhint = true;
    }
    else{
      playpage();
    }
  })

  book.on('animate', function(side, index){

    if(activedictionary){
      activedictionary.reset();
    }

    if(activehighlighter){
      activehighlighter.reset();
    }

    if(index==0){
      apply_shadow(0);
    }
    else if(index==pagecount-1){
      apply_shadow(pagecount-1);
    }

    lastpageelem.hide();

    $('.dictionaryhint').remove();
    book._cancelhint = true;

    book.animating = true;

    media.stopsounds();
  })

  book.on('animated', function(side, index){

    book.animating = false;

    apply_shadow(index);

  })


  book.on('ready', function(){
    
  })

  // have we shown the dictionary hint arrow?
  var dictionaryhint = false;

  book.on('load', function(index){
    book.loading = true;

  })

  book.on('view:page', function(index){

    if(!active){
      return;
    }

    if(index==0 && book._skip_zero_sounds){
      book._skip_zero_sounds = false;
    }
    else{
      setTimeout(function(){
        media.playpagesounds(index, options.play_speech());
      }, 300)  
    }
    
    

    if(index<bookdata.pages.length-1){
      lastpageelem.hide();
    }
    else{
      lastpageelem.show();
    }
    
  })

  book.activate_touch_events = function(){
    /*
    
      TOUCH EVENTS
      
    */
    var hammertime = Hammer($(touch_selector).get(0), {
      drag_min_distance:10,
      tap_max_distance:9
    })

    book.ondragstart = function(ev){
      book.dragging = true;
    }

    hammertime.on('drag start', book.ondragstart)

    book.ondrag = function(ev){
      if(!book.dragging){
        return;
      }

      if(ev.distance>=15){

        book.dragging = false;

        if(gallery.active){
          gallery.animate(ev.direction=='left' ? 1 : -1);
        }
        else{
          if(book.animating || book.loading){
            book.triggernext = function(){
              book.animate_direction(ev.direction=='left' ? 1 : -1);
            }
            return;
          }
          else{
            book.animate_direction(ev.direction=='left' ? 1 : -1);  
          }
        }
        
      }
    }

    hammertime.on('drag', book.ondrag) 

    book.ondragend = function(ev){
      book.dragging = false;
    }

    hammertime.on('drag end', book.ondragend)

    book.ontap = function(ev){
      if(gallery.active){
        gallery.tap(ev);
        return;
      }

      var elem = ev.originalEvent.srcElement;

      var book = $(elem).closest('#book');

      if(book.length<=0){
        return;
      }

      var evpos = {
        x:ev.touches[0].x,
        y:ev.touches[0].y
      }

      if(activedictionary){
        activedictionary(evpos);
      }
    }

    hammertime.on('tap', book.ontap)

    hammertime.on('swipe', function(ev){

      if(gallery.active && ev.direction=='up'){
        close_gallery();
        return;
      }

    })
  }

  book.media = media;
  book.render();

  shadowelem.hide();
  shadowelem.css({
    opacity:0
  })

  return book;
}