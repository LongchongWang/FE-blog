# USE MEDIA IN WEB
## VIDEO RELATED
### Video Preload
> Reference:
> - [How to preload an entire html5 video before play, SOLVED](http://dinbror.dk/blog/how-to-preload-entire-html5-video-before-play-solved/)
> - [Fast Playback with Video Preload
](https://developers.google.com/web/fundamentals/media/fast-playback-with-video-preload)

TL;DR
  
- preload attribute
  ```html
  <video src="video.mp4" preload="none|metadata|auto"></video>
  ```
- `canplaythrough` event
  ```js
  video.addEventListener('canplaythrough', function(){
    console.log('Ready To play through');
  }, false);
  ```
- mute, play, pause and watch the progress event
  ```js
  video.addEventListener("progress", function() {
    // When buffer is 1 whole video is buffered
    if (Math.round(video.buffered.end(0)) / Math.round(video.seekable.end(0)) === 1) {
      // Entire video is downloaded
    }
  }, false);
  ```
- ajax
  ```js
  function loadVideo(url) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.responseType = 'blob';
      req.onload = function() {
        if (this.status = 200) {
          const objUrl = URL.createObjectURL(this.response);
          resolve(objUrl);
        }
      }
      req.onerror = function() {
        reject();
      }
    });
  }
  ```
- link prelaod
  ```html
  <link rel="prelaod" as="video" href="https://video.mp4">
  <body>
    <video src="https://video.mp4"></video>
  </body>
  ```
  ```js
  function preloadFullVideoSupported() { // safari not support
    var link = document.createElement('link');
    link.as = 'video';
    return link.as === 'video';
  }

  function preloadFirstSegmentSupported() {
    var link = document.createElement('link');
    link.as = 'fetch';
    return link.as === 'fetch';
  }
  ```