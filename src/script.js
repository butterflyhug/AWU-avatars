(() => {
  const uploadedImage = new Image();
  uploadedImage.src = 'placeholder.svg';

  const frameImage = new Image();
  frameImage.src = '';
  frameImage.dataset.innerToOuterRatio = '1.0';

  function drawCanvas(frameInnerToOuterRatio) {
    const context = document.querySelector('canvas').getContext('2d');
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.moveTo(0, 0);
    context.beginPath();

    const innerToOuterRatio = +frameImage.dataset.innerToOuterRatio;
    const {width, height} = uploadedImage;
    const minDimension = Math.min(width, height);

    const sizeUnclamped = Math.floor(minDimension / innerToOuterRatio / 2) * 2;
    // Try to set things up so the image in the middle retains its original
    // resolution. But don't let the frame resolution get too low, or the final
    // resolution get too large. (Firefox in particular doesn't downscale well,
    // so results are poorer.)
    const size = Math.min(Math.max(256, sizeUnclamped), 1024);
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
    const exportLink = document.querySelector('#export-link');
    exportLink.href = canvas.toDataURL('image/png');

    for (const link of document.querySelectorAll('a.button')) {
      if (frameImage.src.includes(link.dataset.src)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  }

  uploadedImage.addEventListener('load', drawCanvas);
  frameImage.addEventListener('load', drawCanvas);


  function readImage() {
    if (!this.files || !this.files[0]) return;

    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      uploadedImage.src = event.target.result;
    });
    reader.readAsDataURL(this.files[0]);
  }
  const fileUploadInput = document.querySelector('input[type="file"]');
  fileUploadInput.addEventListener('change', readImage);
  if (fileUploadInput.files && fileUploadInput.files.length) {
    readImage.call(fileUploadInput);
  }


  function setBorder(linkElement) {
    frameImage.dataset.innerToOuterRatio = linkElement.dataset.visibleRatio;
    frameImage.src = linkElement.dataset.src;
  }
  window.setBorder = setBorder;

  // Trigger the default frame to set the defaults for the above.
  document.querySelector('#frame-list-default').click();
})();
