var Ball = (function () {
'use strict';

var $ = window.jQuery
  , b = {}
  , element = $('#balll')
  , delta = { x: 0, y: 0 }
  , start = { x: 0, y: 0 }
  , end = { x: 0, y: 0 }
  , dirty = false

function keepGoing () {
  if (delta.x < 0 && start.x <= end.x) {
    return false
  }
  if (delta.y < 0 && start.y <= end.y) {
    return false
  }
  if (delta.x > 0 && start.x >= end.x) {
    return false
  }
  if (delta.y > 0 && start.y >= end.y) {
    return false
  }
  return delta.x != 0 || delta.y != 0
}

b.render = function (tick) {
  if (dirty) {
    if (keepGoing()) {
      start.y += delta.y * tick * 100
      start.x += delta.x * tick * 100
      element.top(start.y)
      element.left(start.x)
      element.remove('hidden')
    } else {
      delta = { x: 0, y: 0 }
      start = end
      element.add('hidden')
      dirty = false
    }
  }
  return this
}

b.moving = function () {
  return dirty
}

b.move = function (s, e) {
  var v = { x: e.x - s.x, y: e.y - s.y }
    , l = Math.sqrt((v.x * v.x) + (v.y * v.y))

  delta = { x: v.x / l, y: v.y / l }
  start = s
  end = e
  dirty = true
  return this
}

b.html = function (value) {
  element.html(value)
  dirty = true
  return this
}

return b
}())

var Pins = (function () {
'use strict';

var $ = window.jQuery
  , my = {}
  , allowed = {}
  , pins = []
  , last = []
  , hidden = []
  , picked = []
  , numbers = []
  , bowled = 0
  , dirty = true

function initAllowed (index, values) {
  allowed[index] = {}
  values.forEach(function (v) {
    allowed[index][v] = 1
  })
}

initAllowed(0, [4,6,7,8,9])
initAllowed(1, [47,68,78,79,89])
initAllowed(2, [478,479,678,689,789])
initAllowed(3, [0,1,2,3,4,5,6,7,8,9])
initAllowed(4, [1,4,12,14,15,23,25,26,36,45,47,56,57,58,68,78,79,89])
initAllowed(5, [12,14,15,45,47,123,124,125,126,145,147,156,157,158,235,236,245,256,257,258,268,356,368,456,457,458,478,479,567,568,578,579,589,678,689,789])

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

function isAllowed (values, index) {
  return allowed[index][parseInt(values.sort().join(''), 10)]
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
      case 1: return isAllowed(values, 0)
      case 2: return isAllowed(values, 1)
      case 3: return isAllowed(values, 2)
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
    case 1: return isAllowed(values, 3)
    case 2: return isAllowed(values, 4)
    case 3: return isAllowed(values, 5)
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
      score += numbers[values[i]]
    }
  }
  score = ('' + score).split('')
  score = parseInt(score[score.length - 1], 10)
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

function ballCenter (point) {
  return { x: point.x - 2.6, y: point.y - 2.6 }
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
    return ballCenter({ x: x / pins.length, y: y / pins.length })
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
  dirty = true
}

my.set = function (values) {
  numbers = values
  dirty = true
}

my.hide = function () {
  var i = 0
  for (i = 0; i < 10; i += 1) {
    hidden[i] = true
  }
  dirty = true
}

my.render = function (delta) {
  var pin = null
    , i = 0

  if (Ball.render(delta).moving()) {
    return
  }

  if (dirty) {
    for (i = 0; i < 10; i += 1) {
      pin = $('#pin'+i)
      if (hidden[i]) {
        pin.add('hidden')
      } else {
        pin.html(numbers[i])
        pin.remove('hidden')
      }
      if (picked[i]) {
        pin.add('picked')
      } else {
        pin.remove('picked')
      }
    }
    dirty = false
  }
}

my.select = function (value) {
  if (canSelect(value)) {
    pins.push(value)
    picked[value] = true
    dirty = true
  }
}

my.unselect = function (value) {
  if (canUnselect(value)) {
    pins.splice(pins.indexOf(value), 1)
    picked[value] = false
    dirty = true
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

my.bowl = function (target) {
  var i = 0

  Ball.html(target.html()).move(ballCenter(target.center()), pinCenter())

  for (i = 0; i < pins.length; i += 1) {
    hidden[pins[i]] = true
  }

  bowled += pins.length
  last = pins
  pins = []
  dirty = true
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
  , dirty = true

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
  dirty = true
}

s.render = function () {
  var offset = null
    , html = ''
    , i = 0

  if (dirty) {
    for (i = 1; i < 11; i += 1) {
      html = scores[i] !== undefined ? scores[i] : ''
      $('#score'+i).html(html)
    }

    for (i = 1; i < 22; i += 1) {
      html = frames[i] !== undefined ? frames[i] : ''
      $('#frame'+i).html(html)
    }

    offset = $('#frame'+frame).center().y - 0.6
    $('#marker').top(offset)
    dirty = false
  }
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
    frames[frame] = '/'
  }
  balls.push(value)
  score(Math.ceil(frame / 2))

  if (value === 10 && frame % 2 === 1 && frame < 19) {
    frame += 1
  }
  frame += 1
  dirty = true
}

return s
}())

var Chutes = (function () {
'use strict';

var $ = window.jQuery
  , c = {}
  , chute0 = []
  , chute1 = []
  , chute2 = []
  , dirty = true

function peekAt (values) {
  if (values.length < 1) {
    return undefined
  }
  return values[values.length - 1]
}

function drawChute (index, count) {
  var html = ''
    , i = 0

  for (i = 0; i < count; i += 1) {
    html += '&#9673; '
  }
  for (i = i; i < 5; i += 1) {
    html += '&#9678; '
  }
  $('#chute'+index).html(html)
}

function drawBall (index, values) {
  if (values.length > 0) {
    $('#ball'+index).html(values[values.length - 1])
    $('#ball'+index).remove('hidden')
  } else {
    $('#ball'+index).add('hidden')
  }
  drawChute(index, values.length)
}

c.render = function () {
  if (dirty) {
    drawBall(0, chute0)
    drawBall(1, chute1)
    drawBall(2, chute2)
    dirty = false
  }
}

c.reset = function () {
  chute0 = []
  chute1 = []
  chute2 = []
  dirty = true
}

c.set = function (values) {
  chute0 = values.slice(0, 5)
  chute1 = values.slice(5, 8)
  chute2 = values.slice(8, 10)
  dirty = true
}

c.peek = function (chute) {
  switch (chute) {
    case 0: return peekAt(chute0)
    case 1: return peekAt(chute1)
    case 2: return peekAt(chute2)
    default: return undefined
  }
}

c.pop = function (value) {
  switch (value) {
    case 0: chute0.pop(); break
    case 1: chute1.pop(); break
    case 2: chute2.pop(); break
    default: chute0.pop(); chute1.pop(); chute2.pop()
  }
  dirty = true
}

return c
}())

var Timer = {}
Timer.tick = function (now) {
  Timer.delta = (now - (Timer.then || now)) / 1000
  Timer.then = now
}
Timer.reset = function () {
  Timer.then = null
}


;(function (Spare) {
'use strict';

var $ = window.jQuery

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

function resetLane() {
  var values = [0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9]

  Pins.reset(true)

  if (!Scoreboard.over()) {
    do {
      shuffle(values)
      Pins.set(values.slice(0, 10))
      Chutes.set(values.slice(10, 20))
    } while (!Pins.playable(Chutes.peek(0), Chutes.peek(1), Chutes.peek(2)))
  } else {
    Pins.hide()
    Chutes.reset()
  }

  console.log('lane reset')
}

function reset () {
  Scoreboard.reset()
  drawSkip()
  resetLane()
}

function onPin (event) {
  if (Ball.moving()) {
    return
  }
  var target = $(event.srcElement || event.target)
  Pins.toggle(target.data())
}

function nextBall () {
  if (!Scoreboard.over()) {
    Scoreboard.record(Pins.down())
    Chutes.pop()
  } else {
    reset()
  }
}

function onSkip () {
  if (Ball.moving()) {
    return
  }
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
  if (Ball.moving()) {
    return
  }

  var target = $(event.srcElement || event.target)
    , total = Pins.total()

  if (target.unwrap().id === 'ball0') {
    if (total === Chutes.peek(0)) {
      Chutes.pop(0)
      Pins.bowl(target)
    }
  }
  if (target.unwrap().id === 'ball1') {
    if (total === Chutes.peek(1)) {
      Chutes.pop(1)
      Pins.bowl(target)
    }
  }
  if (target.unwrap().id === 'ball2') {
    if (total === Chutes.peek(2)) {
      Chutes.pop(2)
      Pins.bowl(target)
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
  Timer.tick(time)
  Pins.render(Timer.delta)
  Chutes.render()
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
