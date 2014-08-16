;(function (Spare) {
'use strict';

var $ = window.jQuery
  , doc = $(document)
  , balls = []
  , pins = []
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
    $('#pin'+i).html(values[i]).data(i)
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
  pins = []
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

function allPinsVisible () {
  var i = 0
  for (i = 0; i < 9; i += 1) {
    if ($('#pin'+i).has('hidden')) {
      return false
    }
  }
  return true
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

Array.prototype.equals = function (array) {
  var i = 0

  if (!array) {
    return false
  }
  if (this.length !== array.length) {
    return false
  }
  for (i = 0; i < this.length; i += 1) {
    if (this[i] instanceof Array && array[i] instanceof Array) {
      if (!this[i].equals(array[i])) {
        return false
      }
    } else if (this[i] !== array[i]) {
      return false
    }
  }
  return true
}

function canPickPin (value) {
  if (allPinsVisible()) {
    if (pins.equals([])) { return [9,8,7,6,4].indexOf(value) > -1 }
    if (pins.equals([9])) { return [8,7].indexOf(value) > -1 }
    if (pins.equals([8])) { return [9,7,6].indexOf(value) > -1 }
    if (pins.equals([7])) { return [9,8,4].indexOf(value) > -1 }
    if (pins.equals([6])) { return value === 8 }
    if (pins.equals([4])) { return value === 7 }
    if (pins.sort().equals([8,9])) { return [7,6].indexOf(value) > -1 }
    if (pins.sort().equals([7,9])) { return [8,4].indexOf(value) > -1 }
    if (pins.sort().equals([7,8])) { return [9,6,4].indexOf(value) > -1 }
    if (pins.sort().equals([6,8])) { return [9,7].indexOf(value) > -1 }
    if (pins.sort().equals([4,7])) { return [9,8].indexOf(value) > -1 }
  }
  return pins.length < 3
}

function canUnpickPin (value) {
  if (allPinsVisible()) {
    if (pins.sort().equals([4,7,8])) { return value !== 7 }
    if (pins.sort().equals([4,7,9])) { return value !== 7 }
    if (pins.sort().equals([6,7,8])) { return value !== 8 }
    if (pins.sort().equals([6,8,9])) { return value !== 8 }
  }
  return pins.indexOf(value) > -1
}

function onPin (event) {
  var target = $(event.srcElement || event.target)
  console.log(pins)

  if (target.has('picked')) {
    if (canUnpickPin(target.data())) {
      pins.splice(pins.indexOf(target.data()), 1)
      target.toggle('picked')
    }
  } else {
    if (canPickPin(target.data())) {
      pins.push(target.data())
      target.toggle('picked')
    }
  }

  console.log(pins)
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
