var pCanvas = document.getElementById("preview-canvas")
var rCanvas = document.getElementById("render-canvas")
var pCtx = pCanvas.getContext("2d")
var rCtx = rCanvas.getContext("2d")

document.getElementById("file-select").addEventListener("change", function(e) {
  var reader = new FileReader()
  reader.onload = function(event) {
    img = new Image()
    img.onload = function() {
      // load render canvas
      rCanvas.width = img.width
      rCanvas.height = img.height
      rCtx.drawImage(img, 0, 0)

      // load preview canvas
      pCanvas.width = pCanvas.offsetWidth
      pCanvas.height = pCanvas.width / (img.width / img.height)
      pCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, pCanvas.width, pCanvas.height)
            
      // grab raw pixels (format: [r1, g1, b1, a1, r2, g2, b2, a2, ...])
      var pixelsRaw = rCtx.getImageData(0, 0, img.width, img.height).data
      // convert rgb pixels -> greyscale (format: [y1, y1, y1, a1, y2, y2, y2, a2, ...])
      var pixels = rCtx.createImageData(rCanvas.width, rCanvas.height)
      for (i = 0; i < pixelsRaw.length; i++) {
        if (i % 4 == 0) {
          // Y = 0.299 * R + 0.587 * G + 0.114 * B
          pixels.data[i] = 0.299 * pixelsRaw[i] + 0.587 * pixelsRaw[i+1] + 0.114 * pixelsRaw[i+2]
        } else if (i % 4 == 3) { // alpha value
          pixels.data[i] = 255
        } else {
          pixels.data[i] = pixels.data[i-1]
        }
      }
      rCtx.putImageData(pixels, 0, 0)
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(e.target.files[0])
}, false)

function arrToImg(arr) {

}