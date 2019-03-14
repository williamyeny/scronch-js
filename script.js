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

      // generate edge matrix from original image
      imgData = rCtx.getImageData(0, 0, img.width, img.height)
      var eMatrix = genEMatrix(imgData)

      // dp table: element i is an array for the path from pixel i that has [0] = total energy cost for said path, [1 ... n] = the actual path
      var paths = []
      var startX = 0
      for (y = 0; y < eMatrix.length; y++) {
        paths[y] = [] // create x array for paths[y]
        for (x = 0; x < eMatrix[y].length; x++) {
          paths[y][x] = {} 

          // dp base case
          if (y == 0) {
            paths[y][x].cost = eMatrix[y][x]
            paths[y][x].path = [[y, x]]
          } else {
            // compare to the nodes on top of current node to get min path
            var lx = x
            if (x > 0 && paths[y-1][x-1].cost < paths[y-1][lx].cost) {
              lx = x-1
            }
            if (x < paths[0].length-1 && paths[y-1][x+1].cost < paths[y-1][lx].cost) {
              lx = x+1
            }
            paths[y][x].cost = eMatrix[y][x] + paths[y-1][lx].cost
            paths[y][x].path = paths[y-1][lx].path.concat([[y, x]])

            // find starting pixel on bottom row (so it has complete vertical path) that has path with lowest total energy cost
            if (y == eMatrix.length-1 && paths[y][x].cost < paths[y][startX].cost) {
              startX = x
            }
          }
        }
      }

      // seam is the complete path with the lowest total energy (we found the startX above)
      var seam = paths[paths.length-1][startX].path
      rCtx.fillStyle = "red"
      
      for (i = 0; i < seam.length; i++) {
        rCtx.fillRect(seam[i][1], seam[i][0], 1, 1)
      }

      // draw new image
      var newImg = rCtx.createImageData(img.width-1, img.height)
      var offset = 0
      for (i = 0; i < newImg.data.length; i++) {
        var y = Math.floor(i/4 / newImg.width)
        var x =i/4 % newImg.width 
        if (seam[y][1] == x) {
          offset += 4
        }
        newImg.data[i] = imgData.data[i + offset]
      }

      rCtx.putImageData(newImg, 0, 0)
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(e.target.files[0])
}, false)

// function imgTo2D(img) {
//   arr = []
//   for (i = 0; i < img.data.length; i += img.width) {
//     arr.push(img.data.slice(i, i+img.width)) // push an entire row into arr
//   } 
//   return arr
// }



function genEMatrix(img) {
  var eMatrix = []
  var pixelsRaw = img.data
  
  // defining the sobel convolution matrices...
  var kx = [[-1, 0, 1],[-2, 0, 2],[-1, 0, 1]];
  var ky = [[-1, -2, -1],[0,  0,  0],[1,  2,  1]];

  // loop through pixels (format: [r1, g1, b1, a1, r2, g2, b2, a2, ...])
  for (i = 0; i < pixelsRaw.length; i += 4) {
    // get x/y dimensions of pixel
    var x = i/4 % img.width
    var y = Math.floor(i/4 / img.width)

    if (eMatrix.length - 1 < y) {
      eMatrix.push([])
    }

    // since Sobel's requires a 3x3 block around pixel, put max int if it's on an edge
    if (x == 0 || y == 0 || x == img.width-1 || y == img.height-1) {
      eMatrix[y][x] = Number.MAX_SAFE_INTEGER
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
    eMatrix[y][x] = Math.sqrt(magX*magX + magY*magY)
  }
  // console.log(eMatrix)

  return eMatrix
}