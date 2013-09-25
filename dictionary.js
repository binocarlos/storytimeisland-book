// this is the stub

/*

  one of these is created every time a page is loaded

  it represents the active dictionary on the given page

  it emits 'sound' events for the application to handle

  you pass it the data for the page that is active
  
*/
var $ = require('jquery');
var Emitter = require('emitter');

module.exports = function storytimeisland_dictionary(page, currentpos, currentsize){

  function set_scale(elem, targetscale){
    elem.css({

        'transform':'scale(' + targetscale + ', ' + targetscale + ')',
        '-webkit-transform':'scale(' + targetscale + ', ' + targetscale + ')',
        '-moz-transform':'scale(' + targetscale + ', ' + targetscale + ')',
        '-ms-transform':'scale(' + targetscale + ', ' + targetscale + ')'

      })
  }

  function removepopup(popup){
    set_scale(popup, 0.01);
    setTimeout(function(){
      popup.remove();
    }, 1000)
  }

  function find_dictionary(hit){
    var ret = null;

    for(var i in page.dictionary){
      var block = page.dictionary[i];

      var left = parseFloat(block.x);
      var right = left + (parseFloat(block.width));
      var top = parseFloat(block.y);
      var bottom = top + (parseFloat(block.height));

      if(hit.x>=left && hit.x<=right && hit.y>=top && hit.y<=bottom){
        ret = block;
        break;
      }
    }
    return ret;
  }

  /*
  
    this function is run with a coords object (x,y) for the tap on the screen
    
  */
  function dictionary_handle(evpos){

    /*
      
      where they clicked in relation to the book on the screen
      
    */
    var bookevpos = {
      x:evpos.x - currentpos.x,
      y:evpos.y - currentpos.y
    }

    /*
    
      the book coords scaled to match the original boundary from flash
      
    */
    var adjusted_evpos = {
      x:bookevpos.x * (1/currentsize.ratio),
      y:bookevpos.y * (1/currentsize.ratio)
    }

    var offset = currentsize.dictionary_offset;

    if(offset){
      adjusted_evpos.x += offset;
    }

    var block = find_dictionary(adjusted_evpos);

    if(!block){
      return;
    }

    /*
    
      here we check the extra config to see if there are instructions for this dictionary sound
      
    */
    var sound_name = block.name.replace(/_\d+$/, '');
    var page_config = page;
    var extra_config = page_config.extra_config;

    var mp3 = sound_name;
    var text = sound_name;//

    if(extra_config && extra_config.sounds){
      var sound = extra_config.sounds[sound_name];
      if(sound){
        text = sound.text;
        mp3 = sound.sound;
      }
    }

    text = text.replace(/^\W*/, '');
    text = text.replace(/\W*$/, '');

    var textparts = text.split(' ').map(function(s){
      return s.replace(/^(\w)/, function(st){
        return st.toUpperCase();
      })  
    })

    var final_text = textparts.join(' ');

    var popup = $('<div class="dictionarytab animatorquick">' + final_text + '</div>');

    popup.css({
      left:evpos.x-50 + 'px',
      top:evpos.y-50 + 'px'
    })

    $('body').append(popup);

    setTimeout(function(){
      //$bookmedia.playdictionarysound(dictionaryid);
      set_scale(popup, 1);  
    }, 1)

    setTimeout(function(){
      removepopup(popup);
    }, 3000);

    dictionary_handle.emit('sound', mp3);
  }

  dictionary_handle.reset = function(){
    $('.dictionarytab').remove();
  }

  for(var i in Emitter.prototype){
    dictionary_handle[i] = Emitter.prototype[i];
  }

  return dictionary_handle;
}

