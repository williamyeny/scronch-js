var pCanvas = document.getElementById("preview-canvas")
var rCanvas = document.getElementById("render-canvas")
var ctx = canvas.getContext("2d")

document.getElementById("file-select").addEventListener("change", function(e) {
  var reader = new FileReader()
  reader.onload = function(event) {
    img = new Image()
    img.onload = function() {
      rCanvas.width = img.width
      rCanvas.height = img.height
      ctx.drawImage(img, 0, 0)
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(e.target.files[0])
}, false)