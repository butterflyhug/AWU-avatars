const context = document.querySelector("canvas").getContext("2d");

function drawCanvas() {
  if (!uploadedImage.src) return;

  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.moveTo(0, 0);
  context.beginPath();

  const {width, height} = uploadedImage;
  const minDimension = Math.min(width, height);

  const sizeUnclamped = Math.floor(minDimension / frameInnerToOuterRatio / 2) * 2;
  // Try to set things up so the image in the middle retains its original
  // resolution. But don't let the frame resolution get too low, or the final
  // resolution get too large. (Firefox in particular doesn't downscale well,
  // so results are poorer.)
  const size = Math.min(Math.max(250, sizeUnclamped), 800);
  context.canvas.width = size;
  context.canvas.height = size;

  const innerWidth  = (size / sizeUnclamped) * width;
  const innerHeight = (size / sizeUnclamped) * height;
  const center = size / 2;

  // Clip a few extra pixels off the edge so the uploaded image never bleeds
  // through at the borders of the frame
  {
    context.save();
    {
      const kExtraClip = 2;
      context.arc(size/2, size/2, size/2 - kExtraClip, 0, 2 * Math.PI);
      context.clip();

      context.imageSmoothingQuality = 'high';
      context.drawImage(uploadedImage,
        center - innerWidth / 2, center - innerHeight / 2,
        innerWidth, innerHeight);
    }
    context.restore();
  }
  // Draw the frame without clipping. Generally, the frame should have its own
  // border transparency.
  context.drawImage(frameImage, 0, 0, size, size);

  const canvas = document.querySelector('canvas');
  const exportLink = document.querySelector('#export');
  exportLink.href = canvas.toDataURL('image/png');
}

function readImage() {
  if (!this.files || !this.files[0]) return;

  const reader = new FileReader();
  reader.addEventListener("load", (event) => {
    uploadedImage.src = event.target.result;
  });
  reader.readAsDataURL(this.files[0]);
}
document.querySelector("input[type='file']")
    .addEventListener("change", readImage);

function setBorder(innerToOuterRatio, filename) {
  frameImage.src = filename;
  frameInnerToOuterRatio = innerToOuterRatio;
}

const uploadedImage = new Image();
uploadedImage.src = 'placeholder.svg';
uploadedImage.addEventListener("load", drawCanvas);

const frameImage = new Image();
frameImage.src = '';
frameImage.addEventListener("load", drawCanvas);
// Ratio between the inner size of the frame (where the uploaded image gets
// drawn) to the outer size of the frame.
let frameInnerToOuterRatio = 0;

// Trigger the default frame to set the defaults for the above.
document.querySelector('#frame-list-default').click();
