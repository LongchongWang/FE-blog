export const nextFrame = function (fn) {
  if (requestAnimationFrame) {
    requestAnimationFrame(fn)
  } else {
    setTimeout(fn, 34)
  }
}
export const documentVerticalScrollPosition = function () {
  if (window.pageYOffset) return window.pageYOffset // Firefox, Chrome, Opera, Safari.
  if (document.documentElement && document.documentElement.scrollTop) return document.documentElement.scrollTop // Internet Explorer 6 (standards mode).
  if (document.body.scrollTop) return document.body.scrollTop // Internet Explorer 6, 7 and 8.
  return 0 // None of the above.
}

export const viewportHeight = function () {
  return (document.compatMode === 'CSS1Compat') ? document.documentElement.clientHeight : document.body.clientHeight
}

export const viewportWidth = function () {
  return (document.compatMode === 'CSS1Compat') ? document.documentElement.clientWidth : document.body.clientWidth
}

export const documentHeight = function () {
  return (document.height !== undefined) ? document.height : document.body.offsetHeight
}

export const documentMaximumScrollPosition = function () {
  return documentHeight() - viewportHeight()
}

export const elementVerticalClientPosition = function (element) {
  var rectangle = element.getBoundingClientRect()
  return rectangle.top
}

/**
 * Animation tick.
 */
export const scrollVerticalTickToPosition = function (currentPosition, targetPosition) {
  const filter = 0.2
  return new Promise(resolve => {
    function scroll(_currentPosition, _targetPosition) {
      const difference = parseFloat(_targetPosition) - parseFloat(_currentPosition)

      // Snap, then stop if arrived.
      const arrived = (Math.abs(difference) <= 0.5)
      if (arrived) {
        // Apply target.
        window.scrollTo(0.0, _targetPosition)
        resolve()
        return
      }

      // Filtered position.
      _currentPosition = (parseFloat(_currentPosition) * (1.0 - filter)) + (parseFloat(_targetPosition) * filter)

      // Apply target.
      window.scrollTo(0.0, Math.round(_currentPosition))

      // Schedule next tick.
      nextFrame(() => scroll(_currentPosition, _targetPosition))
    }
    scroll(currentPosition, targetPosition)
  })
}

/**
 * For public use.
 *
 * @param padding Top padding to apply above element.
 */
export const scrollVerticalToElement = function (element, padding = 10) {
  var targetPosition = documentVerticalScrollPosition() + elementVerticalClientPosition(element) - padding
  var currentPosition = documentVerticalScrollPosition()

  // Clamp.
  var maximumScrollPosition = documentMaximumScrollPosition()
  if (targetPosition > maximumScrollPosition) targetPosition = maximumScrollPosition

  // Start animation.
  return scrollVerticalTickToPosition(currentPosition, targetPosition)
}
/**
 * For public use.
 */
export const scrollVerticalToTop = function (smooth) {
  if (!smooth) {
    window.scrollTo(0.0, 0.0)
    return Promise.resolve()
  }

  var targetPosition = 0
  var currentPosition = documentVerticalScrollPosition()

  // Clamp.
  var maximumScrollPosition = documentMaximumScrollPosition()
  if (targetPosition > maximumScrollPosition) targetPosition = maximumScrollPosition

  // Start animation.
  return scrollVerticalTickToPosition(currentPosition, targetPosition)
}

/**
 * For public use
 * @param ancestorElement scrollable ancestor element
 * @param padding Top padding to apply  element.
 */
export const scrollHorizontalToElement = function (element, ancestorElement, position = 'center') {
  if (!element || !ancestorElement) return
  if (!element.getBoundingClientRect || !ancestorElement) return
  const clientWidth = viewportWidth()

  function scroll(left, targetElementLeft) {
    // 1. 判断是否达到了目标位置
    const difference = left - targetElementLeft
    if (Math.abs(difference) < 1) return
    // 2. 如果没有，计算父元素目标移动距离
    const currentScrollLeft = ancestorElement.scrollLeft
    const nextScrollLeft = currentScrollLeft + Math.round(difference * 0.2)
    // 3. 滚动
    ancestorElement.scrollLeft = nextScrollLeft
    // 4. 验证是否有效滚动，如果是继续下一次滚动，如果不是终止
    if (ancestorElement.scrollLeft === currentScrollLeft) {
      ancestorElement.scrollLeft = currentScrollLeft + difference
    } else {
      const newLeft = element.getBoundingClientRect().left
      nextFrame(() => scroll(newLeft, targetElementLeft))
    }
  }

  function start() {
    const {
      left,
      width
    } = element.getBoundingClientRect()
    const targetElementLeft = position === 'center' ? Math.round((clientWidth - width) / 2) : 0

    if (width === 0) {
      nextFrame(start)
    } else {
      scroll(left, targetElementLeft)
    }
  }

  start()
}
