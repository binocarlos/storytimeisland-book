// this is the stub

var has3d = require('has-translate3d');

module.exports = function storytimeisland_platform(){
  
  var is_3d = has3d;
  var is_phonegap = false;
  var is_android = false;

  if(window.$phonegap){
    is_phonegap = true;
    /*
    
      androids
      
    */
    if((device.platform || '').toLowerCase().match(/android/)){
      is_android = true;
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

