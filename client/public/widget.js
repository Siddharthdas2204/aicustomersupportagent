(function() {
  const SCRIPT_URL = document.currentScript.src;
  const KB_ID = new URL(SCRIPT_URL).searchParams.get('kbId') || 'default';
  const BASE_URL = SCRIPT_URL.substring(0, SCRIPT_URL.lastIndexOf('/'));
  
  const container = document.createElement('div');
  container.id = 'support-ai-widget-root';
  document.body.appendChild(container);

  const iframe = document.createElement('iframe');
  iframe.src = `${BASE_URL.replace('/public', '')}/widget/${KB_ID}`;
  iframe.style.position = 'fixed';
  iframe.style.bottom = '20px';
  iframe.style.right = '20px';
  iframe.style.width = '400px';
  iframe.style.height = '620px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '999999';
  iframe.style.backgroundColor = 'transparent';
  iframe.allow = 'microphone'; // Important for voice feature
  
  // Initially show only the button size if we wanted, but for simplicity:
  container.appendChild(iframe);
})();
