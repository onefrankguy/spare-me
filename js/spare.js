Array.prototype.peek = function () {
  if (this.length < 1) {
    return undefined
  }
  return this[this.length - 1]
}

var Pins = (function () {
'use strict';

var $ = window.jQuery
  , my = {}
  , pins = []
  , last = []
  , bowled = 0

function countVisible() {
  var count = 0
    , i = 0
  for (i = 0; i < 10; i += 1) {
    if (!$('#pin'+i).has('hidden')) {
      count += 1
    }
  }
  return count
}

function isAllowed (values, allowed) {
  var value = parseInt(values.sort().join(''), 10)
  return allowed.indexOf(value) > -1
}

function isValid (values) {
  if (countVisible() >= 10) {
    switch (values.length) {
      case 0: return true
      case 1: return isAllowed(values, [4,6,7,8,9])
      case 2: return isAllowed(values, [47,68,78,79,89])
      case 3: return isAllowed(values, [478,479,678,689,789])
      default: return false
    }
  } else {
    switch (values.length) {
      case 0: return true
      case 1: return isAllowed(values, [0,1,2,3,4,5,6,7,8,9])
      case 2: return isAllowed(values, [1,4,12,14,15,23,25,26,36,45,47,56,57,58,68,78,79,89])
      case 3: return isAllowed(values, [12,14,15,45,47,123,125,126,145,147,156,157,158,236,245,256,257,258,268,356,368,456,457,458,478,479,568,578,579,589,678,689,789])
      default: return false
    }
  }
}

function canSelect (value) {
  var values = pins.slice()
  values.push(value)
  return isValid(values)
}

function canUnselect (value) {
  var values = pins.slice()
    , index = values.indexOf(value)
  if (index > -1) {
    values.splice(index, 1)
    return isValid(values)
  }
  return false
}

my.reset = function () {
  var i = 0
  for (i = 0; i < pins.length; i += 1) {
    $('#pin'+pins[i]).remove('picked')
  }
  pins = []
  last = []
  bowled = 0
}

my.select = function (value) {
  if (canSelect(value)) {
    pins.push(value)
    $('#pin'+value).toggle('picked')
  }
}

my.unselect = function (value) {
  if (canUnselect(value)) {
    pins.splice(pins.indexOf(value), 1)
    $('#pin'+value).toggle('picked')
  }
}

my.empty = function () {
  return countVisible() <= 0
}

my.bowl = function () {
  var i = 0
  for (i = 0; i < pins.length; i += 1) {
    $('#pin'+pins[i]).add('hidden')
  }
  bowled += pins.length
  last = pins
  pins = []
}

my.down = function () {
  return bowled
}

my.total = function () {
  var score = 0
    , i = 0
  for (i = 0; i < pins.length; i += 1) {
    score += $('#pin'+pins[i]).int()
  }
  score = parseInt(('' + score).split('').peek(), 10)
  return score
}

return my
}())

;(function (Spare) {
'use strict';

var $ = window.jQuery
  , doc = $(document)
  , balls = []
  , pins = []
  , last = []
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

function resetLane() {
  var i = 0
    , values = []

  for (i = 0; i < 10; i += 1) {
    values.push(i)
    values.push(i)
  }
  shuffle(values)

  for (i = 0; i < 10; i += 1) {
    $('#pin'+i).html(values[i]).data(i).remove('hidden')
  }

  chute0 = values.slice(10, 15)
  chute1 = values.slice(15, 18)
  chute2 = values.slice(18, 20)

  resetBall(0, chute0)
  resetBall(1, chute1)
  resetBall(2, chute2)
}

function resetGame () {
  var i = 0

  balls = []
  frame = 1

  for (i = 1; i <= 10; i += 1) {
    $('#score'+i).html('')
  }
  for (i = 1; i <= 21; i += 1) {
    $('#frame'+i).html('')
  }
}

function reset () {
  Pins.reset()
  resetGame()
  resetLane()
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

function adjacentPins (value) {
  switch (value) {
    case 0: return [1, 4]
    case 1: return [0, 2, 4, 5]
    case 2: return [1, 3, 5, 6]
    case 3: return [2, 6]
    case 4: return [0, 1, 5, 7]
    case 5: return [1, 2, 4, 6, 7, 8]
    case 6: return [2, 3, 5, 8]
    case 7: return [4, 5, 8, 9]
    case 8: return [5, 6, 7, 9]
    case 9: return [7, 8]
    default: return []
  }
}

function isAdjacentPin (a, b) {
  return adjacentPins(a).indexOf(b) > -1
}

function onPin (event) {
  var target = $(event.srcElement || event.target)
  if (target.has('picked')) {
    Pins.unselect(target.data())
  } else {
    Pins.select(target.data())
  }
}

function rollBall () {
  Pins.bowl()
  if (Pins.empty()) {
    bowl(Pins.down())
    resetLane()
  }
}

function onBall (event) {
  var target = $(event.srcElement || event.target)
    , total = Pins.total()

  if (total !== chute0.peek() && total !== chute1.peek() && total !== chute2.peek()) {
    chute0.pop()
    chute1.pop()
    chute2.pop()
    drawBall(0, chute0)
    drawBall(1, chute1)
    drawBall(2, chute2)
    bowl(Pins.down())
    Pins.reset()
    return
  }

  if (target.unwrap().id === 'ball0') {
    if (total === chute0.peek()) {
      chute0.pop()
      drawBall(0, chute0)
      rollBall()
    }
  }
  if (target.unwrap().id === 'ball1') {
    if (total === chute1.peek()) {
      chute1.pop()
      drawBall(1, chute1)
      rollBall()
    }
  }
  if (target.unwrap().id === 'ball2') {
    if (total === chute2.peek()) {
      chute2.pop()
      drawBall(2, chute2)
      rollBall()
    }
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
