// this is the stub

var has3d = require('has-translate3d');

module.exports = function storytimeisland_platform(options){
  
  options = options || {};

  var is_3d = options.allow3d && has3d;
  var is_phonegap = options.is_phonegap;
  var is_android = false;

  if(is_phonegap){
    /*
    
      androids
      
    */
    if((device.platform || '').toLowerCase().match(/android/)){
      is_android = true;

      // android < 4 is not 3d
      if(device.version<4){
        is_3d = false;
      }
    }

    
  }

  return {
    is_phonegap:is_phonegap,
    is_3d:is_3d,
    is_android:is_android
  }
}

