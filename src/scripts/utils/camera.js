export const takePicture = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });

    const video = document.createElement('video');
    video.srcObject = stream;
    video.setAttribute('playsinline', '');
    await video.play();

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Stop all tracks
    stream.getTracks().forEach(track => track.stop());

    // Convert to base64
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Error accessing camera:', error);
    throw error;
  }
}; 