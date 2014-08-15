;(function (Spare) {
'use strict';

var $ = window.jQuery
  , doc = $(document)
  , i = 0

function onPin (event) {
  var target = $(event.srcElement || event.target)
  console.log('Touching pin: '+target.html())
}

Spare.play = function () {
  for (i = 0; i <= 9; i += 1) {
    $('#pin'+i).touch(onPin, null)
  }
}

})(window.Spare = window.Spare || {})
