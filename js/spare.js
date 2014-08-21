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
  , hidden = []
  , picked = []
  , bowled = 0

function countVisible() {
  var count = 0
    , i = 0

  for (i = 0; i < 10; i += 1) {
    if (!hidden[i]) {
      count += 1
    }
  }

  return count
}

function getAdjacent (value) {
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

function isAdjacent (a, b) {
  return getAdjacent(a).indexOf(b) > -1
}

function anyAdjacent (a, b) {
  var i = 0
    , j = 0
  for (i = 0; i < a.length; i += 1) {
    for (j = 0; j < b.length; j += 1) {
      if (isAdjacent(a[i], b[j])) {
        return true
      }
    }
  }
  return false
}

function isAllowed (values, allowed) {
  var value = parseInt(values.sort().join(''), 10)
  return allowed.indexOf(value) > -1
}

function isValid (values) {
  var i = 0

  for (i = 0; i < values.length; i += 1) {
    if (hidden[values[i]]) {
      return false
    }
  }

  if (countVisible() >= 10) {
    switch (values.length) {
      case 0: return true
      case 1: return isAllowed(values, [4,6,7,8,9])
      case 2: return isAllowed(values, [47,68,78,79,89])
      case 3: return isAllowed(values, [478,479,678,689,789])
      default: return false
    }
  }

  if (last.length > 0 && values.length > 0) {
    if (!anyAdjacent(values, last)) {
      return false
    }
  }

  switch (values.length) {
    case 0: return true
    case 1: return isAllowed(values, [0,1,2,3,4,5,6,7,8,9])
    case 2: return isAllowed(values, [1,4,12,14,15,23,25,26,36,45,47,56,57,58,68,78,79,89])
    case 3: return isAllowed(values, [12,14,15,45,47,123,124,125,126,145,147,156,157,158,235,236,245,256,257,258,268,356,368,456,457,458,478,479,567,568,578,579,589,678,689,789])
    default: return false
  }
}

function getScore (values) {
  var score = 0
    , pin = null
    , i = 0
  if (values.length <= 0) {
    return undefined
  }
  for (i = 0; i < values.length; i += 1) {
    if (!hidden[values[i]]) {
      score += $('#pin'+values[i]).int()
    }
  }
  score = parseInt(('' + score).split('').peek(), 10)
  return score
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

function canScore (ball) {
  var i = 0
    , j = 0
    , k = 0
  if (ball === undefined) {
    return false
  }
  for (i = 0; i < 10; i += 1) {
    if (isValid([i]) && getScore([i]) === ball) {
      console.log('score with: '+[i]+' ball: '+ball)
      return true
    }
    for (j = 0; j < 10; j += 1) {
      if (isValid([i,j]) && getScore([i,j]) === ball) {
        console.log('score with: '+[i,j]+' ball: '+ball)
        return true
      }
      for (k = 0; k < 10; k += 1) {
        if (isValid([i,j,k]) && getScore([i,j,k]) === ball) {
          console.log('score with: '+[i,j,k]+' ball: '+ball)
          return true
        }
      }
    }
  }
  return false
}

function pinCenter () {
  var x = 0
    , y = 0
    , i = 0
    , c = null

  if (pins.length > 0) {
    for (i = 0; i < pins.length; i += 1) {
      c = $('#pin'+pins[i]).center()
      x += c.x
      y += c.y
    }
    x = (x / pins.length) - 2.6
    y = (y / pins.length) - 2.6
    return { x: x, y: y }
  }
  return undefined
}

my.reset = function (all) {
  var i = 0
  if (all !== true) {
    for (i = 0; i < pins.length; i += 1) {
      picked[pins[i]] = false
      hidden[pins[i]] = false
    }
  } else {
    for (i = 0; i < 10; i += 1) {
      picked[i] = false
      hidden[i] = false
    }
  }
  pins = []
  last = []
  bowled = 0
}

my.render = function () {
  var pin = null
    , i = 0

  for (i = 0; i < 10; i += 1) {
    pin = $('#pin'+i)
    if (hidden[i]) {
      pin.add('hidden')
    } else {
      pin.remove('hidden')
    }
    if (picked[i]) {
      pin.add('picked')
    } else {
      pin.remove('picked')
    }
  }
}

my.select = function (value) {
  if (canSelect(value)) {
    pins.push(value)
    picked[value] = true
  }
}

my.unselect = function (value) {
  if (canUnselect(value)) {
    pins.splice(pins.indexOf(value), 1)
    picked[value] = false
  }
}

my.toggle = function (value) {
  if (picked[value]) {
    this.unselect(value)
  } else {
    this.select(value)
  }
}

my.playable = function (ball1, ball2, ball3) {
  if (countVisible() <= 0) {
    return false
  }
  return canScore(ball1) || canScore(ball2) || canScore(ball3)
}

my.bowl = function () {
  var i = 0

  for (i = 0; i < pins.length; i += 1) {
    hidden[pins[i]] = true
  }

  bowled += pins.length
  last = pins
  pins = []
}

my.down = function () {
  return bowled
}

my.total = function () {
  return getScore(pins)
}

my.empty = function () {
  return countVisible() <= 0
}

return my
}())

var Scoreboard = (function () {
'use strict';

var $ = window.jQuery
  , s = {}
  , balls = []
  , scores = []
  , frames = []
  , frame = 1

function score (turn) {
  var sum = 0
    , t = 0
    , i = 0

  for (t = 1; t <= turn; t += 1) {
    if (balls[i] === 10) {
      if (balls.length > i+2) {
        sum += 10 + balls[i+1] + balls[i+2]
        scores[t] = sum
      }
      i += 1
    } else if (balls[i] + balls[i+1] === 10) {
      if (balls.length > i+2) {
        sum += 10 + balls[i+2]
        scores[t] = sum
      }
      i += 2
    } else {
      if (balls.length > i+1) {
        sum += balls[i] + balls[i+1]
        scores[t] = sum
      }
      i += 2
    }
  }
}

s.reset = function () {
  balls = []
  scores = []
  frames = []
  frame = 1
}

s.render = function () {
  var i = 0
    , html = ''
    , offset = $('#frame'+frame).center().y - 0.6

  for (i = 1; i < 11; i += 1) {
    html = scores[i] !== undefined ? scores[i] : ''
    $('#score'+i).html(html)
  }

  for (i = 1; i < 22; i += 1) {
    html = frames[i] !== undefined ? frames[i] : ''
    $('#frame'+i).html(html)
  }

  $('#marker').top(offset)
}

s.over = function () {
  return scores[10] !== undefined
}

s.skippable = function () {
  return frame % 2 === 1 && frame < 21
}

s.record = function (value) {
  if (value === undefined) {
    return
  }

  if (this.over()) {
    return
  }

  frames[frame] = value
  if (value === 10) {
    frames[frame] = 'X'
  }
  if (frame % 2 === 0 && value + balls[balls.length - 1] === 10) {
    frames[fram] = '/'
  }
  balls.push(value)
  score(Math.ceil(frame / 2))

  if (value === 10 && frame % 2 === 1 && frame < 19) {
    frame += 1
  }
  frame += 1
}

return s
}())

;(function (Spare) {
'use strict';

var $ = window.jQuery
  , chute0 = []
  , chute1 = []
  , chute2 = []

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

function drawSkip () {
  if (Scoreboard.over()) {
    $('#skip').html('New Game')
  } else {
    $('#skip').html('Next Ball')
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
  var values = [0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9]
    , i = 0

  Pins.reset(true)

  if (!Scoreboard.over()) {
    do {
      shuffle(values)
      for (i = 0; i < 10; i += 1) {
        $('#pin'+i).html(values[i]).data(i)
      }
      chute0 = values.slice(10, 15)
      chute1 = values.slice(15, 18)
      chute2 = values.slice(18, 20)
    } while (!Pins.playable(chute0.peek(), chute1.peek(), chute2.peek()))
  } else {
    for (i = 0; i < 10; i += 1) {
      $('#pin'+i).add('hidden')
    }
    chute0 = []
    chute1 = []
    chute2 = []
  }

  resetBall(0, chute0)
  resetBall(1, chute1)
  resetBall(2, chute2)

  console.log('lane reset')
}

function reset () {
  Scoreboard.reset()
  drawSkip()
  resetLane()
}

function onPin (event) {
  var target = $(event.srcElement || event.target)
  Pins.toggle(target.data())
}

function nextBall () {
  if (!Scoreboard.over()) {
    Scoreboard.record(Pins.down())
    chute0.pop()
    chute1.pop()
    chute2.pop()
    drawBall(0, chute0)
    drawBall(1, chute1)
    drawBall(2, chute2)
  } else {
    reset()
  }
}

function onSkip () {
  if (Scoreboard.skippable()) {
    nextBall()
    Pins.reset()
  } else {
    nextBall()
    resetLane()
  }
  drawSkip()
}

function onBall (event) {
  var target = $(event.srcElement || event.target)
    , total = Pins.total()

  if (target.unwrap().id === 'ball0') {
    if (total === chute0.peek()) {
      chute0.pop()
      drawBall(0, chute0)
      Pins.bowl()
    }
  }
  if (target.unwrap().id === 'ball1') {
    if (total === chute1.peek()) {
      chute1.pop()
      drawBall(1, chute1)
      Pins.bowl()
    }
  }
  if (target.unwrap().id === 'ball2') {
    if (total === chute2.peek()) {
      chute2.pop()
      drawBall(2, chute2)
      Pins.bowl()
    }
  }
  if (Pins.empty()) {
    nextBall()
    resetLane()
  }
  drawSkip()
}

function render (time) {
  requestAnimationFrame(render)
  Pins.render()
  Scoreboard.render()
}

Spare.play = function () {
  var i = 0

  for (i = 0; i < 10; i += 1) {
    $('#pin'+i).touch(onPin, null)
  }
  for (i = 0; i < 3; i += 1) {
    $('#ball'+i).touch(onBall, null)
  }
  $('#skip').touch(onSkip, null)
  reset()
  requestAnimationFrame(render)
}

})(window.Spare = window.Spare || {})
