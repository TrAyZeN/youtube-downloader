const errorElement = document.getElementById('error');
const downloadingElement = document.getElementById('downloading');
const downloadFinishedElement = document.getElementById('download-finished');
const progressCircleElement = document.getElementById('progress-circle');
const optionsTab = document.getElementById('options-tab');
const deployOptionsButton = document.getElementById('deploy-options');
let filename = '';
let videoTitle = '';
let optionsTabSelected = 'mp3';

window.onload = () => {
  optionsTab.style.display = 'none'; // set options tab display property to 'none' to avoid errors when getting its display property
};

document.getElementById('submit-url-button').onclick = () => {
  submitUrl();
};

document.getElementById('deploy-options').onclick = () => {
  showOptions();
};

document.getElementById('tab-button-mp3').onclick = () => {
  openOptionsTab('mp3');
};

document.getElementById('tab-button-mp4').onclick = () => {
  openOptionsTab('mp4');
};

document.getElementById('download-button').onclick = () => {
  goToDownloadUrl();
};

function drawProgressCircle(percentage) {
  const circleContext = {
    drawingContext: progressCircleElement.getContext('2d'),
    center: {
      x: progressCircleElement.width / 2,
      y: progressCircleElement.height / 2,
    },
    size: {
      width: progressCircleElement.width,
      height: progressCircleElement.height,
    },
    radius: 80,
    thickness: 20,
  };

  circleContext.drawingContext.clearRect(0, 0, circleContext.size.width, circleContext.size.height);

  drawInactiveProgress(circleContext, percentage);
  drawActiveProgress(circleContext, percentage);

  drawPercentageText(circleContext, percentage);
}

function drawInactiveProgress(circleContext, percentage) {
  const {
    drawingContext, center, radius, thickness,
  } = circleContext;
  const angle = percentage === 0 ? 2 * Math.PI : 2 * Math.PI * percentage;

  drawingContext.fillStyle = '#FFFFFF';
  drawingContext.beginPath();
  drawingContext.arc(center.x, center.y, radius + thickness, 0, angle, true);
  drawingContext.lineTo(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle));
  drawingContext.arc(center.x, center.y, radius, angle, 0, false);
  drawingContext.lineTo(center.x + radius + thickness, center.y);
  drawingContext.fill();
  drawingContext.closePath();
}

function drawActiveProgress(circleContext, percentage) {
  const {
    drawingContext, center, radius, thickness,
  } = circleContext;
  const angle = 2 * Math.PI * percentage;

  drawingContext.fillStyle = '#00d4ff';
  drawingContext.beginPath();
  drawingContext.arc(center.x, center.y, radius + thickness, 0, angle, false);
  drawingContext.lineTo(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle));
  drawingContext.arc(center.x, center.y, radius, angle, 0, true);
  drawingContext.lineTo(center.x + radius + thickness, center.y);
  drawingContext.fill();
  drawingContext.closePath();
}

function drawPercentageText(circleContext, percentage) {
  const { drawingContext, center, size } = circleContext;

  drawingContext.save();
  drawingContext.rotate(Math.PI / 2);
  drawingContext.translate(0, -size.height);
  drawingContext.fillStyle = '#FFFFFF';
  drawingContext.font = '30px monospace';
  drawingContext.fillText(`${Math.ceil(percentage * 100)}%`, center.x - 20, center.y + 10);
  drawingContext.restore();
}

function submitUrl() {
  const videoUrl = document.getElementById('url-field').value;
  const httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.LOADING) {
      if (httpRequest.status === 200) { handleRequestLoading(getLatestResponse(httpRequest)); } else { console.log('AJAX request failed'); }
    } else if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) { handleRequestDone(getLatestResponse(httpRequest)); } else { console.log('AJAX request failed'); }
    }
  };

  postConvertRequest(httpRequest, videoUrl, optionsTabSelected);
}

function postConvertRequest(httpRequestObject, videoUrl, format) {
  httpRequestObject.open('POST', '/convert', true);
  httpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  httpRequestObject.send(`videourl=${videoUrl}&format=${format}`);
}

function getLatestResponse(httpRequestObject) {
  const response = httpRequestObject.responseText.split('\n');
  return JSON.parse(response.pop());
}

function handleRequestLoading(latestResponse) {
  switch (latestResponse.state) {
    case 'valid-url':
      downloadingElement.style.display = 'block';
      downloadFinishedElement.style.display = 'none';
      errorElement.style.display = 'none';
      document.getElementById('options').style.display = 'none';
      drawProgressCircle(0);
      break;
    case 'download-progress':
      drawProgressCircle(latestResponse.percentage);
      break;
    default:
      console.log('Error : invalid response state');
      break;
  }
}

function handleRequestDone(latestResponse) {
  switch (latestResponse.state) {
    case 'server-download-finished':
      downloadFinishedElement.style.display = 'block';
      downloadingElement.style.display = 'none';
      errorElement.style.display = 'none';

      filename = latestResponse.filename;
      videoTitle = latestResponse.videotitle;
      break;
    case 'invalid-url':
      showErrorElement('Sorry, the url that you provided is not valid');
      break;
    case 'get-info-error':
      showErrorElement('An error occurred when trying to get video information');
      break;
    case 'ffmpeg-error':
      showErrorElement('An error occurred when downloading the video');
      break;
    case 'invalid-format-error':
      showErrorElement('Invalid file format');
      break;
    default:
      console.log('Error : unreferenced response state');
      break;
  }
}

function showErrorElement(errorMessage) {
  errorElement.style.display = 'block';
  downloadingElement.style.display = 'none';
  downloadFinishedElement.style.display = 'none';
  errorElement.textContent = errorMessage;
}

/*
 *  When the button to deploy the option menu is clicked
 *  it shows or hide the option menu depending on actual state of the option menu
 */

function showOptions() {
  if (optionsTab.style.display === 'none') {
    showOptionsTab();
  } else if (optionsTab.style.display === 'block') {
    hideOptionsTab();
  }
}

function showOptionsTab() {
  fadeInOptionsTab();

  // show the content of the tab selected
  if (optionsTabSelected === 'mp3') {
    document.getElementById('tab-button-mp3').click();
  } else if (optionsTabSelected === 'mp4') {
    document.getElementById('tab-button-mp4').click();
  }
}

function fadeInOptionsTab() {
  optionsTab.style.display = 'block';
  let opacity = optionsTab.style.opacity = 0;
  deployOptionsButton.style.transform = 'scale(3, 1)';
  deployOptionsButton.style.webkitTransform = 'scale(3, 1)';
  const id = setInterval(() => {
    if (optionsTab.style.opacity >= 1) {
      clearInterval(id);
    } else {
      opacity += 0.02;
      optionsTab.style.opacity = opacity;
      deployOptionsButton.style.transform = `scale(3, ${String(1 - opacity * 2)})`;
      deployOptionsButton.style.webkitTransform = `scale(3, ${String(1 - opacity * 2)})`;
    }
  }, 10);
}

function hideOptionsTab() {
  fadeOutOptionsTab();
  hideOptionsTabContent();
}

function fadeOutOptionsTab() {
  let opacity = optionsTab.style.opacity = 1;
  deployOptionsButton.style.transform = 'scale(3, -1)';
  deployOptionsButton.style.webkitTransform = 'scale(3, -1)';
  const id = setInterval(() => {
    if (optionsTab.style.opacity <= 0) {
      clearInterval(id);
      optionsTab.style.display = 'none';
    } else {
      opacity -= 0.02;
      optionsTab.style.opacity = opacity;
      deployOptionsButton.style.transform = `scale(3, ${String(1 - opacity * 2)})`;
      deployOptionsButton.style.webkitTransform = `scale(3, ${String(1 - opacity * 2)})`;
    }
  }, 10);
}

function hideOptionsTabContent() {
  const tabContent = document.getElementsByClassName('options-tab-content');
  for (let i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = 'none';
  }
}

/*
 *  When an options tab button is clicked
 *  it shows the options tab
 *  and hides the options of the other tab
 */

function openOptionsTab(tabSelected) {
  optionsTabSelected = tabSelected;

  const tabButtonMp3 = document.getElementById('tab-button-mp3');
  const tabButtonMp4 = document.getElementById('tab-button-mp4');

  if (optionsTabSelected === 'mp3') {
    tabButtonMp3.className = 'active';
    tabButtonMp4.className = '';
  } else if (optionsTabSelected === 'mp4') {
    tabButtonMp3.className = '';
    tabButtonMp4.className = 'active';
  }

  hideOptionsTabContent();

  document.getElementById(optionsTabSelected).style.display = 'block';
}

function goToDownloadUrl() {
  window.location.href += `download?file=${filename}&title=${videoTitle}`;
}
