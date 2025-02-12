document.addEventListener('DOMContentLoaded', () => {
  const widthRange = document.getElementById('width');
  const widthValue = document.getElementById('width-value');
  const heightRange = document.getElementById('height');
  const heightValue = document.getElementById('height-value');
  const opacityInput = document.getElementById('opacity');
  const saveButton = document.querySelector('.save-btn');


  browser.storage.local.get('chatSettings').then(result => {
    const settings = result.chatSettings || {
      width: '300px',
      height: '70vh',
      opacity: 0.9
    };

    widthRange.value = parseInt(settings.width);
    widthValue.value = parseInt(settings.width);
    heightRange.value = parseInt(settings.height) || 70;
    heightValue.value = parseInt(settings.height) || 70;
    opacityInput.value = settings.opacity;
  });


  widthRange.addEventListener('input', () => {
    widthValue.value = widthRange.value;
  });

  widthValue.addEventListener('input', () => {
    widthRange.value = widthValue.value;
  });


  heightRange.addEventListener('input', () => {
    heightValue.value = heightRange.value;
  });

  heightValue.addEventListener('input', () => {
    heightRange.value = heightValue.value;
  });


  saveButton.addEventListener('click', () => {
    const settings = {
      width: `${widthRange.value}px`,
      height: `${heightRange.value}px`,
      opacity: parseFloat(opacityInput.value)
    };

    browser.storage.local.set({ chatSettings: settings }).then(() => {

      saveButton.textContent = 'Saved!';
      setTimeout(() => {
        saveButton.textContent = 'Save Settings';
      }, 1500);
    });
  });
});