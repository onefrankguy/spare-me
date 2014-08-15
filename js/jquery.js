;(function () {

function Fn (selector) {
  var i = 0
    , nodes = []
    , results = []

  if (selector instanceof Fn) {
    return selector
  }

  this.element = selector
  if (typeof selector === 'string') {
    if (selector.indexOf('#') === 0) {
      this.element = document.getElementById(selector.slice(1))
    }
    if (selector.indexOf('.') === 0) {
      nodes = document.getElementByClassName(selector.slice(1))
      for (i = 0; i < nodes.length; i += 1) {
        results.push(new Fn(nodes[i]))
      }
      return results
    }
    if (selector.indexOf('<') === 0) {
      selector = selector.slice(1, -1)
      nodes = document.getElementByTagName(selector)
      for (i = 0; i < nodes.length; i += 1) {
        results.push(new Fn(nodes[i]))
      }
      return results
    }
  }
  return this
}

Fn.prototype.html = function (value) {
  if (this.element) {
    if (value === undefined) {
      return this.element.innerHTML
    }
    this.element.innerHTML = value
  }
  return this
}

Fn.prototype.int = function (value) {
  return parseInt(this.html(), 10)
}

Fn.prototype.on = function (message, callback) {
  if (this.element) {
    this.element.addEventListener(message, callback, false)
  }
}

Fn.prototype.off = function (message, callback) {
  if (this.element) {
    this.element.removeEventListener(message, callback, false)
  }
}

Fn.prototype.touch = function (start, end) {
  if (this.element) {
    this.element.onmousedown = function (event) {
      if (start) {
        start(event)
      }
      document.onmousemove = function (event) {
        event.preventDefault()
      }
      document.onmouseup = function (event) {
        if (end) {
          end(event)
        }
        document.onmousemove = null
        document.onmouseup = null
      }
    }
    this.element.ontouchstart = function (event) {
      this.element.onmousedown = null
      if (start) {
        start(event)
      }
      document.ontouchmove = function (event) {
        event.preventDefault()
      }
      document.ontouchend = function (event) {
        if (end) {
          end(event)
        }
        document.ontouchmove = null
        document.ontouchend = null
      }
    }
  }
}

function root (selector) {
  return new Fn(selector)
}

window.jQuery = root

})()
