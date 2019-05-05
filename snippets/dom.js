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
  const fps = 60
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
      if (requestAnimationFrame) {
        requestAnimationFrame(() => scroll(_currentPosition, _targetPosition))
      } else {
        setTimeout(() => scroll(_currentPosition, _targetPosition), (1000 / fps))
      }
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
