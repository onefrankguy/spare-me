var Storage = (function () {
'use strict';

var s = {}

s.load = function (key) {
  var item = localStorage.getItem(key)
  console.log('loaded '+key+': '+item)
  return item
}

s.save = function (key, item) {
  console.log('saving '+key+': '+item)
  localStorage.setItem(key, item)
}

s.clear = function () {
  localStorage.clear()
}

s.loadInt = function (key) {
  return parseInt(this.load(key), 10)
}

s.loadString = function (key) {
  return this.load(key)
}

s.loadInts = function (key) {
  var items = this.load(key).split(',')
    , i = 0
  for (i = 0; i < items.length; i += 1) {
    items[i] = parseInt(items[i], 10)
  }
  return items
}

s.loadBools = function (key) {
  var items = this.load(key).split(',')
    , i = 0
  for (i = 0; i < items.length; i += 1) {
    items[i] = (items[i] === 'true')
  }
  return items
}

s.has = function (key) {
  var item = localStorage.getItem(key)
  return item !== undefined && item !== null
}

return s
}())

// A pseudo random number generator based on Alexander Klimov and Adi Shamer's
// paper "A New Class of Invertible Mappings".
var PRNG = (function () {
'use strict';

  var r = {}
    , max = Math.pow(2, 32)
    , state = undefined

// Call seed with 'null' to start in a random state.
r.seed = function (value) {
  if (value !== undefined) {
    state = parseInt(value, 10)
  }
  if (isNaN(state)) {
    state = Math.random(Math.random() * max)
  }
  return state
}

r.random = function () {
  state += (state * state) | 5
  return (state >>> 32) / max
}

return r
}())

var Game = (function () {
'use strict';

var g = {}
  , color = undefined

function newColor () {
  var hash = color
  do {
    hash = Math.floor(Math.random() * 1677216)
    PRNG.seed(hash)
    hash = ('000000' + hash.toString(16)).substr(-6)
  } while (hash === color)
  return hash
}

g.save = function () {
  Storage.save('color', color)
  Storage.save('seed', PRNG.seed())
}

g.load = function () {
  color = undefined
  if (Storage.has('color')) {
    color = Storage.loadString('color')
  }
  if (Storage.has('seed')) {
    PRNG.seed(Storage.loadInt('seed'))
  }
}

g.start = function (callback) {
  var hash = window.location.hash.substring(1)

  if (/^[0-9A-F]{6}$/i.test(hash)) {
    if (color !== hash) {
      color = hash
    }
  } else {
    if (color === undefined) {
      color = newColor()
    }
  }

  PRNG.seed(parseInt(color, 16))
  console.log('starting game: #'+color)
  if (window.location.hash.substring(1) !== color) {
    window.location.hash = color
  } else {
    Scoreboard.reset()
    Controls.reset(true)
  }
}

g.bowl = function () {
  Storage.clear()
  newColor()
  this.save()
  window.location.hash = color
}

return g
}())

var Difficulty = (function () {
'use strict';

var $ = window.jQuery
  , d = {}
  , level = 0
  , dirty = true

function drawRules () {
  var html = ''
  if (level >= 0) {
    html += '<li>Have fun!</li>'
  }
  if (level >= 1) {
    html += '<li>Picked pins must be adjacent.</li>'
    html += '<li>Remove the front pins first.</li>'
  }
  if (level >= 2) {
    html += '<li>Rule #2 includes pins removed by the last ball.</li>'
  }
  $('#rules').html(html)
}

d.render = function () {
  var i = 0
  if (dirty) {
    for (i = 0; i < 3; i += 1) {
      if (i !== level) {
        $('#level'+i).remove('pressed')
      } else {
        $('#level'+i).add('pressed')
      }
    }
    drawRules()
    dirty = false
  }
}

d.toggle = function (element) {
  element.toggle('pressed')
}

d.set = function (value) {
  level = parseInt(value, 10)
  this.save()
}

d.get = function () {
  return level
}

d.save = function () {
  Storage.save('level', level)
  dirty = true
}

d.load = function () {
  if (Storage.has('level')) {
    level = Storage.loadInt('level')
    dirty = true
  }
}

return d
}())

var Ball = (function () {
'use strict';

var $ = window.jQuery
  , b = {}
  , element = $('#balll')
  , delta = { x: 0, y: 0 }
  , start = { x: 0, y: 0 }
  , end = { x: 0, y: 0 }
  , dirty = 0

b.render = function () {
  if (dirty === 1) {
    element.left(start.x)
    element.top(start.y)
    element.remove('hidden')
    dirty = 2
  } else if (dirty === 2) {
    element.animate('rolling', function () {
      element.add('hidden')
      dirty = 0
    })
    element.left(end.x)
    element.top(end.y)
  }
  return this
}

b.moving = function () {
  return dirty > 0
}

b.move = function (s, e) {
  var v = { x: e.x - s.x, y: e.y - s.y }
    , l = Math.sqrt((v.x * v.x) + (v.y * v.y))

  delta = { x: v.x / l, y: v.y / l }
  start = s
  end = e
  dirty = 1
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
  , scoring = []
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

  if (Difficulty.get() > 0) {
    if (countVisible() >= 10) {
      switch (values.length) {
        case 0: return true
        case 1: return isAllowed(values, 0)
        case 2: return isAllowed(values, 1)
        case 3: return isAllowed(values, 2)
        default: return false
      }
    }
  }

  if (Difficulty.get() > 1) {
    if (last.length > 0 && values.length > 0) {
      if (!anyAdjacent(values, last)) {
        return false
      }
    }
  }

  if (Difficulty.get() > 0) {
    switch (values.length) {
      case 0: return true
      case 1: return isAllowed(values, 3)
      case 2: return isAllowed(values, 4)
      case 3: return isAllowed(values, 5)
      default: return false
    }
  }

  return values.length <= 3
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
    scoring = []
    return false
  }
  for (i = 0; i < 10; i += 1) {
    if (isValid([i]) && getScore([i]) === ball) {
      scoring = [ball,numbers[i]]
      return true
    }
    for (j = i + 1; j < 10; j += 1) {
      if (isValid([i,j]) && getScore([i,j]) === ball) {
        scoring = [ball,numbers[i],numbers[j]]
        return true
      }
      for (k = j + 1; k < 10; k += 1) {
        if (isValid([i,j,k]) && getScore([i,j,k]) === ball) {
          scoring = [ball,numbers[i],numbers[j],numbers[k]]
          return true
        }
      }
    }
  }
  scoring = []
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

my.save = function () {
  Storage.save('pins', pins)
  Storage.save('last', last)
  Storage.save('hidden', hidden)
  Storage.save('picked', picked)
  Storage.save('numbers', numbers)
  Storage.save('bowled', bowled)
  dirty = true
}

my.load = function () {
  if (Storage.has('pins')) {
    pins = Storage.loadInts('pins')
  }
  if (Storage.has('last')) {
    last = Storage.loadInts('last')
  }
  if (Storage.has('hidden')) {
    hidden = Storage.loadBools('hidden')
  }
  if (Storage.has('picked')) {
    picked = Storage.loadBools('picked')
  }
  if (Storage.has('numbers')) {
    numbers = Storage.loadInts('numbers')
  }
  if (Storage.has('bowled')) {
    bowled = Storage.loadInt('bowled')
  }
  dirty = true
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
  this.save()
}

my.set = function (values) {
  numbers = values
  this.save()
}

my.hide = function () {
  var i = 0
  for (i = 0; i < 10; i += 1) {
    hidden[i] = true
  }
  this.save()
}

my.render = function () {
  var pin = null
    , i = 0

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
    this.save()
  }
}

my.unselect = function (value) {
  if (canUnselect(value)) {
    pins.splice(pins.indexOf(value), 1)
    picked[value] = false
    this.save()
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
  return canScore(ball1) || canScore(ball2) || canScore(ball3)
}

my.example = function () {
  return scoring
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
  this.save()
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

    offset = $('#frame'+frame).center().y - 0.7
    if (offset > 0) {
      $('#marker').top(offset)
    }
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

c.save = function () {
  Storage.save('chute0', chute0)
  Storage.save('chute1', chute1)
  Storage.save('chute2', chute2)
  dirty = true
}

c.load = function () {
  if (Storage.has('chute0')) {
    chute0 = Storage.loadInts('chute0')
  }
  if (Storage.has('chute1')) {
    chute1 = Storage.loadInts('chute1')
  }
  if (Storage.has('chute2')) {
    chute2 = Storage.loadInts('chute2')
  }
  dirty = true
}

c.hide = function () {
  chute0 = []
  chute1 = []
  chute2 = []
  this.save()
}

c.render = function () {
  if (dirty) {
    drawBall(0, chute0)
    drawBall(1, chute1)
    drawBall(2, chute2)
    dirty = false
  }
}

c.reset = function (all) {
  if (all !== true) {
    this.pop()
  } else {
    this.hide()
  }
  this.save()
}

c.set = function (values) {
  chute0 = values.slice(0, 5)
  chute1 = values.slice(5, 8)
  chute2 = values.slice(8, 10)
  this.save()
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
  this.save()
}

return c
}())

var Controls = (function () {
'use strict';

var $ = window.jQuery
  , c = {}
  , example = false
  , dirty = false

function drawExample() {
  var example = Pins.example()
    , pins = example.slice(1)
    , score = 0
    , digit = 0
    , html = ''
    , i = 0

  if (example.length > 0) {
    for (i = 0; i < pins.length; i += 1) {
      score += parseInt(pins[i], 10)
    }
    digit = ('' + score).split('')
    digit = parseInt(digit[digit.length - 1], 10)

    html = pins.join(', ')
    if (pins.length > 1) {
      // Drop the Oxford comma from the list of pins.
      i = html.lastIndexOf(',')
      html = html.substr(0, i) + ' and' + html.substr(i+1)
    }

    html = ' Pick '+(pins.length > 1 ? 'pins' : 'pin')+' '+html+'.'
    if (pins.length > 1) {
      html += ' They sum to '+score+'.'
    }
    html += ' The last digit of '+score+' is '+digit+'.'
    html += ' Pick ball '+example[0]+'.'
    html += ' You score '+(pins.length > 2 ? 'three points' : (pins.length > 1 ? 'two points' : 'one point' ))+'!'
    $('#example').html(html)
  }
}

c.render = function () {
  if (dirty) {
    if (Scoreboard.over()) {
      $('#nextBall').add('invisible')
      $('#newGame').remove('invisible')
    } else {
      $('#newGame').add('invisible')
      $('#nextBall').remove('invisible')
    }
    if (example === true) {
      drawExample()
      example = false
    }
    dirty = false
  }
}

c.reset = function (all) {
  if (Scoreboard.over()) {
    Pins.hide()
    Chutes.hide()
  }
  example = all
  dirty = true
}

return c
}())

;(function (Spare) {
'use strict';

var $ = window.jQuery

function shuffle (array) {
  var i = 0
    , j = 0
    , temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(PRNG.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

function nextFrame () {
  var values = [0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9]
  Scoreboard.record(Pins.down())
  Pins.reset(true)
  Chutes.reset(true)
  do {
    shuffle(values)
    Pins.set(values.slice(0, 10))
    Chutes.set(values.slice(10, 20))
  } while (!Pins.playable(Chutes.peek(0), Chutes.peek(1), Chutes.peek(2)))
}

function nextBall () {
  Scoreboard.record(Pins.down())
  Pins.reset()
  Chutes.reset()
}

function onPin (target) {
  if (Ball.moving()) {
    return
  }
  Pins.toggle(target.data())
}

function onNextBall (target) {
  target.add('pressed')
}

function offNextBall (target) {
  target.remove('pressed')
  if (Ball.moving()) {
    return
  }

  if (Scoreboard.skippable()) {
    nextBall()
  } else {
    nextFrame()
  }

  Controls.reset()
}

function onNewGame (target) {
  target.add('pressed')
}

function offNewGame (target) {
  target.remove('pressed')
  if (!Ball.moving()) {
    Game.bowl()
  }
}

function onBall (target) {
  if (Ball.moving()) {
    return
  }

  var total = Pins.total()
    , id = target.data()

  if (total === Chutes.peek(id)) {
    Chutes.pop(id)
    Pins.bowl(target)
  }

  if (Pins.empty()) {
    nextFrame()
  }

  Controls.reset()
}

function onLevel (target) {
  Difficulty.toggle(target)
}

function offLevel (target) {
  Difficulty.set(target.data())
}

function onHashChange () {
  if (!Ball.moving()) {
    nextFrame()
    Scoreboard.reset()
    Controls.reset(true)
  }
}

function render () {
  requestAnimationFrame(render)
  Difficulty.render()
  Ball.render()
  Chutes.render()
  if (!Ball.moving()) {
    Pins.render()
    Scoreboard.render()
    Controls.render()
  }
}

Spare.play = function () {
  var i = 0

  for (i = 0; i < 10; i += 1) {
    $('#pin'+i).touch(onPin, null)
  }
  for (i = 0; i < 3; i += 1) {
    $('#ball'+i).touch(onBall, null)
    $('#level'+i).touch(onLevel, offLevel)
  }
  $('#nextBall').touch(onNextBall, offNextBall)
  $('#newGame').touch(onNewGame, offNewGame)
  $(window).on('hashchange', onHashChange)

  Difficulty.load()
  Pins.load()
  Chutes.load()
  Game.load()
  Game.start(onHashChange)
  requestAnimationFrame(render)
}

})(window.Spare = window.Spare || {})
