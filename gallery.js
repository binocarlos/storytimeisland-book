// this is the stub

/*

  one of these is created every time a page is loaded

  it represents the active dictionary on the given page

  it emits 'sound' events for the application to handle

  you pass it the data for the page that is active
  
*/

var $ = require('jquery');
var Emitter = require('emitter');
var template = require('./templates/gallery');
var pagetemplate = require('./templates/gallerypage');

module.exports = function storytimeisland_gallery(options){
  
  var append_to = options.append_to || $('body');
  var thumb_width = options.thumb_width || 112;
  var thumb_src = options.thumb_src || 'images/page<number>.thumb.png';

  var pages = options.pages;

  var total_width = pages * (thumb_width+10);

  var gallery = {
    active:false
  };

  for(var i in Emitter.prototype){
    gallery[i] = Emitter.prototype[i];
  }

  var $elem = gallery.$elem = $('' + template);
  var $imageselem = $elem.find('.galleryimages');

  $imageselem.css({
    width:total_width + 'px'
  })

  for(var pageindex=0; pageindex<pages.length; pageindex++){
    var gallerypage = $('' + pagetemplate);
    var holder = gallerypage.find('.gallerypage');
    holder.attr('data-gallery-index', pageindex);
    holder.css({
      'background':'url(' + thumb_src.replace(/<number>/, pageindex) + ')'
    })
    holder.find('.badge').html(pageindex);
    $imageselem.append(holder);
  }

  append_to.append($elem);

  var imageholder = $imageselem;

  var total_width = imageholder.width();
  var visible_width = $elem.width();
  var max_offset = total_width-visible_width + 200;
  var current_offset = 0;

  gallery.destroy = function(){
    $elem.remove();
  }

  gallery.animate = function(direction){
    var new_offset = current_offset + (direction*(visible_width/4)*-1);
    if(new_offset>0){
      new_offset = 0;
    }
    else if(new_offset<-max_offset){
      new_offset = -max_offset;
    }

    imageholder.css({
      left:new_offset + 'px'
    })
    current_offset = new_offset;
  }

  gallery.set_current_page = function(index){
    $elem.find('span.badge').removeClass('badge-warning');
    $elem.find('span.badge').eq(index).addClass('badge-warning');
  }

  gallery.tap = function(ev){
    var target = ev.originalEvent.target;
    if(!target){
      return;
    }
    target = $(target);
    if(target.hasClass('arrowimg')){
      var direction = parseInt(target.attr('data-direction'));
      gallery.animate(direction); 
      return;
    }
    var galleryimage = target.closest('.gallerypage');
    if(galleryimage.length<=0){
      return;
    }

    var index = parseInt(galleryimage.attr('data-gallery-index'));
    gallery.emit('loadpage', index);
    
  }

  return gallery;
}

