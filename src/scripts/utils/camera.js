export const takePicture = async () => {
  try {
    // Request camera access first
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });

    // Create preview container
    const previewContainer = document.createElement('div');
    previewContainer.style.position = 'fixed';
    previewContainer.style.top = '0';
    previewContainer.style.left = '0';
    previewContainer.style.width = '100%';
    previewContainer.style.height = '100%';
    previewContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    previewContainer.style.zIndex = '1000';
    previewContainer.style.display = 'flex';
    previewContainer.style.flexDirection = 'column';
    previewContainer.style.alignItems = 'center';
    previewContainer.style.justifyContent = 'center';

    // Create video element
    const video = document.createElement('video');
    video.srcObject = stream;
    video.setAttribute('playsinline', '');
    video.style.width = '100%';
    video.style.maxWidth = '500px';
    video.style.borderRadius = '8px';
    await video.play();

    // Create capture button
    const captureButton = document.createElement('button');
    captureButton.textContent = 'Take Photo';
    captureButton.style.marginTop = '20px';
    captureButton.style.padding = '10px 20px';
    captureButton.style.backgroundColor = '#4CAF50';
    captureButton.style.color = 'white';
    captureButton.style.border = 'none';
    captureButton.style.borderRadius = '4px';
    captureButton.style.cursor = 'pointer';

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.style.padding = '10px 20px';
    closeButton.style.backgroundColor = '#f44336';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';

    // Add elements to container
    previewContainer.appendChild(video);
    previewContainer.appendChild(captureButton);
    previewContainer.appendChild(closeButton);
    document.body.appendChild(previewContainer);

    // Return promise that resolves when photo is taken or rejected
    return new Promise((resolve, reject) => {
      captureButton.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Remove preview container
        document.body.removeChild(previewContainer);

        // Convert to base64
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      closeButton.onclick = () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Remove preview container
        document.body.removeChild(previewContainer);
        reject(new Error('Camera capture cancelled'));
      };
    });
  } catch (error) {
    console.error('Error accessing camera:', error);
    throw error;
  }
}; 