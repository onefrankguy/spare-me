;(function (Spare) {
'use strict';

var $ = window.jQuery
  , doc = $(document)
  , i = 0
  , score = 0
  , turn = 0
  , frame = 0

function onPin (event) {
  var target = $(event.srcElement || event.target)
    , value = target.int()
    , scoreBox = null
    , frameBox = null

  scoreBox = $('#score'+turn)
  frameBox = $('#frame'+turn+frame)
  console.log('#frame'+turn+frame)

  if (value === 0) {
    frameBox.html('X')
    score += 10
  } else {
    frameBox.html(value)
    score += value
  }

  frame += 1
  if (frame > 1) {
    scoreBox.html(score)
    frame = 0
    turn += 1
  }
  if (turn > 10) {
    turn = 0
    score = 0
  }
}

Spare.play = function () {
  for (i = 0; i <= 9; i += 1) {
    $('#pin'+i).touch(onPin, null)
  }
}

})(window.Spare = window.Spare || {})
