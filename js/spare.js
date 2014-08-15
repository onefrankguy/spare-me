;(function (Spare) {
'use strict';

var $ = window.jQuery
  , doc = $(document)
  , i = 0
  , score = 0
  , turn = 0
  , frame = 0

function reset () {
  turn = 0
  score = 0

  for (i = 0; i < 10; i += 1) {
    $('#score'+i).html('')
    $('#frame'+i+'0').html('')
    $('#frame'+i+'1').html('')
  }
}

function onPin (event) {
  var target = $(event.srcElement || event.target)
    , value = target.int()
    , scoreBox = null
    , frameBox = null

  if (turn >= 10) {
    reset()
  }

  scoreBox = $('#score'+turn)
  frameBox = $('#frame'+turn+frame)

  if (value === 0) {
    frameBox.html('X')
    score += 10
  } else {
    frameBox.html(value)
    score += value
  }
  if (frame >= 1) {
    scoreBox.html(score)
    frame = 0
    turn += 1
  } else {
    frame = 1
  }
}

Spare.play = function () {
  for (i = 0; i <= 9; i += 1) {
    $('#pin'+i).touch(onPin, null)
  }
  reset()
}

})(window.Spare = window.Spare || {})
