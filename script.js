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
            
      // grab raw pixels
      var pixelsRaw = rCtx.getImageData(0, 0, img.width, img.height).data

      // new image
      var renderImage = rCtx.createImageData(rCanvas.width, rCanvas.height)
      var pixels = renderImage.data

      // defining the sobel convolution matrices...
      var kx = [[-1, 0, 1],[-2, 0, 2],[-1, 0, 1]];
      var ky = [[-1, -2, -1],[0,  0,  0],[1,  2,  1]];

      // loop through pixels (format: [r1, g1, b1, a1, r2, g2, b2, a2, ...])
      for (i = 0; i < pixelsRaw.length; i += 4) {
        // get x/y dimensions of pixel
        var x = i/4 % img.width
        var y = Math.floor(i/4 / img.height)

        // ignore edge pixels since Sobel's requires a 3x3 block around pixel
        if (x == 0 || y == 0 || x == img.width-1 || y == img.height-1) {
          continue
        }

        var magX = 0.0
        var magY = 0.0
        // loop through 3x3 area around pixel
        for(a = 0; a < 3; a++) {
          for(b = 0; b < 3; b++) {            
            var index = ((x + a - 1) + (y + b - 1) * img.width) * 4;

            // Y = 0.299 * R + 0.587 * G + 0.114 * B
            var brightness =  0.299 * pixelsRaw[index] + 0.587 * pixelsRaw[index+1] + 0.114 * pixelsRaw[index+2]

            magX += brightness * kx[a][b]
            magY += brightness * ky[a][b]
          }
        }
        var mag = magX*magX + magY*magY
        pixels[i] = Math.sqrt(mag)
        pixels[i+1] = Math.sqrt(mag)
        pixels[i+2] = Math.sqrt(mag)
        pixels[i+3] = 255
        
      }
      rCtx.putImageData(renderImage, 0, 0)
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(e.target.files[0])
}, false)

function arrToImg(arr) {

}