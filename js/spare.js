;(function (Spare) {
'use strict';

var $ = window.jQuery
  , doc = $(document)
  , balls = []
  , frame = 1

function reset () {
  var i = 0

  for (i = 1; i <= 10; i += 1) {
    $('#score'+i).html('')
  }
  for (i = 1; i <= 21; i += 1) {
    $('#frame'+i).html('')
  }
  balls = []
  frame = 1
}

function score (turn) {
  var sum = 0
    , t = 0
    , i = 0

  for (t = 1; t <= turn; t += 1) {
    if (balls[i] === 10) {
      if (balls.length > i+2) {
        sum += 10 + balls[i+1] + balls[i+2]
        $('#score'+t).html(sum)
      }
      i += 1
    } else if (balls[i] + balls[i+1] === 10) {
      if (balls.length > i+2) {
        sum += 10 + balls[i+2]
        $('#score'+t).html(sum)
      }
      i += 2
    } else {
      if (balls.length > i+1) {
        sum += balls[i] + balls[i+1]
        $('#score'+t).html(sum)
      }
      i += 2
    }
  }
}

function bowl (value) {
  console.log(frame)
  if (frame > 21) {
    reset()
    return
  }
  if (frame > 20 && $('#score10').html() !== '') {
    reset()
    return
  }

  $('#frame'+frame).html(value)
  balls.push(value)
  score(Math.ceil(frame / 2))

  if (value === 10 && frame % 2 === 1 && frame < 19) {
    frame += 1
  }
  frame += 1
}

function onPin (event) {
  bowl($(event.srcElement || event.target).int())
}

function onBall (event) {
  bowl(10)
}

Spare.play = function () {
  var i = 0

  for (i = 0; i < 10; i += 1) {
    $('#pin'+i).touch(onPin, null)
  }
  for (i = 0; i < 3; i += 1) {
    $('#ball'+i).touch(onBall, null)
  }
  reset()
}

})(window.Spare = window.Spare || {})
