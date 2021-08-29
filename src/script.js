const context = document.querySelector("canvas").getContext("2d");

const frameImage = new Image();
frameImage.src = 'frame-white.png';
const uploadedImage = new Image();

function drawCanvas() {
  if (!uploadedImage.src) return;

  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.moveTo(0, 0);
  context.beginPath();

  const {width, height} = uploadedImage;
  const size = Math.max(width, height);
  const heightPadding = size - height;
  const widthPadding = size - width;
  context.canvas.width = size;
  context.canvas.height = size;
  
  context.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
  context.clip();
  
  context.fillStyle = 'white';
  context.fillRect(0, 0, size, size);
  context.drawImage(uploadedImage, (size-width)/2, (size-height)/2);
  context.drawImage(frameImage, 0, 0, size, size);
  
  const canvas = document.querySelector('canvas');
  const exportLink = document.querySelector('#export');
  exportLink.href = canvas.toDataURL('image/png');
}
frameImage.addEventListener("load", drawCanvas);
uploadedImage.addEventListener("load", drawCanvas);

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

function setBorder(filename) {
  frameImage.src = filename;
}