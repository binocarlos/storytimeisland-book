// this is the stub

var $ = require('jquery');


/*
var has3d = require('has-translate3d');

var Gallery = require('./gallery');
var Media = require('./media');
var Hammer = require('hammer');

*/

var PageTurner = require('pageturner');
var Platform = require('storytimeisland-platform');
var Media = require('storytimeisland-media');
var Dictionary = require('storytimeisland-dictionary');
var TextHighlighter = require('storytimeisland-texthighlighter');

/*

 

*/
module.exports = function storytimeisland_book(options){

  //bookselector, html, templates, data, global_settings){


  /*
  
    SETTINGS
    
  */
  var bookselector = options.selector || '#book';
  var shadowselector = options.shadow || '#shadow';
  var lastpageselector = options.lastpage || '#lastpagehtml';

  var bookdata = options.data || {};
  var bookconfig = bookdata.config;
  var apply_pageclass = options.apply_pageclass || 'bookpage';
  
  var perspective = options.perspective || 950;
  
  var platform = Platform(options);
  var is_3d = platform.is_3d;
  var is_phonegap = platform.is_phonegap;

  var speech_active = options.speech;
  var dictionary_active = options.dictionary;
  var highlighter_active = options.highlighter;

  var startpage = bookconfig.test_page || 0;


  var currentindex = -1;

  var shadowloaded = false;

  var rendered = false;

  /*
  
    STATE
    
  */
  var activedictionary = null;
  var activehighlighter = null;

  var dragging = null;
  var animating = false;
  var loading = false;
  var currentsize = {};
  var currentpos = {};

  /*
  
    ELEM
    
  */
  var bookelem = $(bookselector);
  var shadowelem = $(shadowselector);
  var lastpageelem = $(lastpageselector);
  
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
    has3d:is_3d,
    bookselector:bookselector,
    pageselector:'.page',
    apply_pageclass:'bookpage',
    startpage:startpage,
    perspective:perspective
  })

  var media = Media(bookdata, {
    speech_active:speech_active    
  })

  var loading_status = {};
  function checkloaded(){
    if(loading_status.images && loading_status.sounds){
      
      /*
  
        sort out the DOM
        
      */
      book.emit('loaded');
    }
  }

  media.on('loaded:sounds', function(){
    loading_status.sounds = true;
    checkloaded();
  })

  media.on('loaded:images', function(){
    loading_status.images = true;
    checkloaded();
  })

  book.load = function(options){
    media.load(options);
  }


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


  book.on('resize', function(newsize){
    
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
        width:window.innerWidth,
        height:window.innerHeight
      }

      var xpos = windowsize.width/2 - newsize.width/2;
      var ypos = windowsize.height/2 - newsize.height/2;

      currentpos = {
        x:xpos,
        y:ypos
      }

      bookelem.css({
        left:xpos + 'px',
        top:ypos + 'px'
      })

      lastpageelem.css({
        left:xpos + 'px',
        top:ypos + 'px'
      })

      shadowelem.css({
        left:xpos + 'px',
        top:ypos + 'px',
        'margin-left':shadow_offset(get_current_page())
      }).height(newsize.height).width(shadow_width(get_current_page()))

      book.load_page(book.currentpage);

    }, 10)

  })


  book.on('loaded', function(index){

    /*
    loading = false;
    if(index<=0){
      $('.leftarrow').css({
        display:'none'
      })
    }
    else{
      $('.leftarrow').css({
        display:'block'
      }); 
    }

    if(index>=pagecount-1){
      $('.rightarrow').css({
        display:'none'
      })
    }
    else{
      $('.rightarrow').css({
        display:'block'
      })
    }
    */

    if(shadowloaded){
      $('#shadow').css({
        display:'block'
      })  
    }
    
    /*
    activedictionary = Dictionary(get_page_data(index), currentpos, currentsize);

    // only do the text highlighting when the voice is reading
    if(global_settings.voice_audio){
      activehighlighter = TextHighlighter(html[index], bookdata.config.highlighters ? bookdata.config.highlighters[index] : []);

      if(index!=currentindex){
        activehighlighter.start();  
      }
      $('#book').append(activehighlighter.elem);
    }
    else{
      activehighlighter = null;
    }

    activedictionary.on('sound', function(mp3){
      book.emit('dictionary', mp3);
    })
    */

    if(book.triggernext){
      book.triggernext();
      book.triggernext = null;
    }
    else if(index!=currentindex){
      book.emit('view:page', index);
    }

    //gallery.set_current_page(index);

    currentindex = index;
  })

  book.on('animate', function(side){

    /*
    if(activedictionary){
      activedictionary.reset();
    }

    if(activehighlighter){
      activehighlighter.reset();
    }
    */

    if(book.currentpage==1 && side=='left'){
      apply_shadow(0);
    }
    else if(book.currentpage==pagecount-2 && side=='right'){
      apply_shadow(pagecount-1);
    }
    else if(book.currentpage==pagecount-1){
      lastpageelem.hide();
    }

    animating = true;
    book.emit('animate');
  })

  book.on('animated', function(side){

    if(book.currentpage==0 && side=='right'){
      apply_shadow(1);
    }
    else if(book.currentpage==pagecount-1 && side=='left'){
      apply_shadow(pagecount-2);
    }

    animating = false;
    //apply_shadow(side);
  })


  book.on('ready', function(){
    //$(bookselector).addClass('dropshadow');
  })

  book.on('load', function(index){
    loading = true;
  })


  book.media = media;
  book.render();

  $('#shadow').hide();

  setTimeout(function(){
    $('#shadow').fadeIn();
    shadowloaded = true;
  }, 1000)

  return book;

  /*
  
    MEDIA
    

  var media = Media(bookdata, global_settings);

  media.on('loaded:all', function(){

    book.emit('media:loaded');
    
  })

  media.on('loaded:sound', function(src){
    
  })

  */













  /*
  
    GALLERY
    

  var gallery = Gallery({
    pages:bookdata.pages,
    append_to:bookelem.parent()
  });

  gallery.on('loadpage', function(index){
    close_gallery();
    if(index==0){
      apply_shadow(0);

    }
    else if(index==pagecount-1){
      apply_shadow(pagecount-1);
    }
    $('#lastpagehtml').hide();
    book.animate_index(index);
  })

  function open_gallery(){
    gallery.$elem.css({
      top:'0px'
    })
    setTimeout(function(){
      gallery.active = true;
      //$('#homebutton').show();
      //$('#teddybutton .normal').hide();
      //$('#teddybutton .highlight').show();
    }, 10)
  }

  function close_gallery(){
    gallery.$elem.css({
      top:'-120px'
    })
    setTimeout(function(){
      gallery.active = false;
      //$('#homebutton').hide();
      //$('#teddybutton .normal').show();
      //$('#teddybutton .highlight').hide();
    }, 10)
    
    
  }


  */


/*



  function taparrow(arrow){
    if(animating || loading){
      book.triggernext = function(){
        book.animate_direction(arrow.hasClass('leftarrow') ? -1 : 1);
      }
      return;
    }
    else{
      book.animate_direction(arrow.hasClass('leftarrow') ? -1 : 1);
    }
  }

  function clickteddy(){
    if(gallery.active){
      close_gallery();
    }
    else{
      open_gallery(); 
    }
  }

  function clickhome(){
    close_gallery();
    setTimeout(function(){
      book_factory.emit('gohome');  
    },500)
    
  }

  book.ondragstart = function(ev){
    dragging = true;
  }

  book.ondrag = function(ev){
    if(!dragging){
      return;
    }

    if(ev.distance>=15){
      if(gallery.active){
        gallery.animate(ev.direction=='left' ? 1 : -1);
      }
      else{
        if(animating || loading){
          book.triggernext = function(){
            book.animate_direction(ev.direction=='left' ? 1 : -1);
          }
          return;
        }
        book.animate_direction(ev.direction=='left' ? 1 : -1);    
      }

      dragging = false;
    }

  }

  book.ondragend = function(ev){
    dragging = false;
  }

  book.onswipe = function(ev){
    if(gallery.active && ev.direction=='up'){
      close_gallery();
      return;
    }
  }

  book.ontap = function(ev){
    var elem = ev.originalEvent.srcElement;

    var teddy = $(elem).closest('#teddybutton');

    if(teddy.length>0){
      clickteddy();
      return;
    }

    var home = $(elem).closest('#homebutton');

    if(home.length>0){
      clickhome();
      return;
    }

    if(gallery.active){
      gallery.tap(ev);
      return;
    }

    if($(elem).hasClass('arrow')){
      taparrow($(elem));
      return;
    }
    else{
      var book = $(elem).closest(bookselector);

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
  }



  */
}

