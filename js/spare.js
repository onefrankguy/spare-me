;(function (Spare) {
'use strict';

var $ = window.jQuery
  , doc = $(document)
  , balls = []
  , chute0 = []
  , chute1 = []
  , chute2 = []
  , frame = 1

function shuffle (array) {
  var i = 0
    , j = 0
    , temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

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

function drawBall (index, values) {
  if (values.length > 0) {
    $('#ball'+index).html(values[values.length - 1])
  } else {
    $('#ball'+index).add('hidden')
  }
  drawChute('#chute'+index, values.length)
}

function resetBall (index, values) {
  $('#ball'+index).remove('hidden')
  drawBall(index, values)
}

function resetAlley () {
  var i = 0
    , values = []

  for (i = 0; i < 10; i += 1) {
    values.push(i)
    values.push(i)
  }
  shuffle(values)

  for (i = 0; i < 10; i += 1) {
    $('#pin'+i).html(values[i])
  }

  chute0 = values.slice(10, 15)
  chute1 = values.slice(15, 18)
  chute2 = values.slice(18, 20)

  resetBall(0, chute0)
  resetBall(1, chute1)
  resetBall(2, chute2)
}

function reset () {
  var i = 0

  balls = []
  frame = 1

  for (i = 1; i <= 10; i += 1) {
    $('#score'+i).html('')
  }
  for (i = 1; i <= 21; i += 1) {
    $('#frame'+i).html('')
  }

  resetAlley()
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
  if (value === undefined) {
    return
  }

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
    , value = null

  if (target.unwrap().id === 'ball0') {
    bowl(chute0.pop())
    drawBall(0, chute0)
  }

  if (target.unwrap().id === 'ball1') {
    bowl(chute1.pop())
    drawBall(1, chute1)
  }

  if (target.unwrap().id === 'ball2') {
    bowl(chute2.pop())
    drawBall(2, chute2)
  }
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
