;(function (Spare) {
'use strict';

var $ = window.jQuery
  , doc = $(document)
  , balls = []
  , ball0 = 5
  , ball1 = 3
  , ball2 = 2
  , frame = 1

function drawChute (selector, count) {
  var i = 0
    , html = ''

  for (i = 0; i < count; i += 1) {
    html += '&#9673; '
  }
  for (i = i; i < 5; i += 1) {
    html += '&#9678; '
  }
  $(selector).html(html)
}

function reset () {
  var i = 0

  for (i = 1; i <= 10; i += 1) {
    $('#score'+i).html('')
  }
  for (i = 1; i <= 21; i += 1) {
    $('#frame'+i).html('')
  }
  balls = []
  ball0 = 5
  ball1 = 3
  ball2 = 2
  frame = 1

  drawChute('#chute0', ball0)
  drawChute('#chute1', ball1)
  drawChute('#chute2', ball2)
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
  if ($('#score10').html() !== '') {
    reset()
    return
  }

  $('#frame'+frame).html(value)
  if (value === 10) {
    $('#frame'+frame).html('X')
  }
  if (frame % 2 === 0 && value + balls[balls.length - 1] === 10) {
    $('#frame'+frame).html('/')
  }
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
  var target = $(event.srcElement || event.target)
    , html = ''
    , i = 0

  if (target.unwrap().id === 'ball0') {
    ball0 -= 1
    drawChute('#chute0', ball0)
  }

  if (target.unwrap().id === 'ball1') {
    ball1 -= 1
    drawChute('#chute1', ball1)
  }

  if (target.unwrap().id === 'ball2') {
    ball2 -= 1
    drawChute('#chute2', ball2)
  }

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
