(function () {
  var lastTime = 0
    , vendor = ["ms", "mos", "webkit", "o"]
    , i = 0

  while (i < vendor.length && !window.requestAnimationFrame) {
    window.requestAnimationFrame = window[vendor[i]+"RequestAnimationFrame"]
    window.cancelAnimationFrame = window[vendor[i]+"CancelAnimationFrame"] || window[vendor[i]+"RequestCancelAnimationFrame"]
    i += 1
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback, element) {
      var currTime = new Date().getTime()
        , timeToCall = Math.max(0, 16 - (currTime - lastTime))
        , timerId = setTimeout(function () {
            (currTime + timeToCall)
        }, timeToCall)
      lastTime = currTime + timeToCall
      return timerId
    }
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id)
    }
  }
}())
