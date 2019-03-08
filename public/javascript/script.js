var errorElement = document.getElementById("error");
var downloadingElement = document.getElementById("downloading");
var downloadFinishedElement = document.getElementById("download-finished");
var progressCircle = document.getElementById("progress-circle");
var optionsTab = document.getElementById("options-tab");
var deployOptionsButton = document.getElementById("deploy-options");
var fileName = "";
var videoTitle = "";
var optionsTabSelected = "mp3";


window.onload = function() {
    optionsTab.style.display = "none";  // set options tab display property to 'none' to avoid error when getting its display property
}


/*
 *  Draw the progress circle and the text according to the percentage passed as arguement
 */

function drawProgressCircle(percentage) {
    let context = progressCircle.getContext("2d");

    let centerX = progressCircle.width/2;
    let centerY = progressCircle.height/2;
    let radius = 80;
    let thickness = 20;

    context.clearRect(0, 0, progressCircle.width, progressCircle.height);

    if (percentage == 0) {  // only draw the inactive percentage
        context.fillStyle = "#FFFFFF";
        context.beginPath();
        context.arc(centerX, centerY, radius+thickness, 0, 2*Math.PI, true);
        context.lineTo(centerX + radius*Math.cos(2*Math.PI), centerY + radius*Math.sin(2*Math.PI));
        context.arc(centerX, centerY, radius, 2*Math.PI, 0, false);
        context.lineTo(centerX + radius+thickness, centerY);
        context.fill();
        context.closePath();
    }
    else {
        // draw the active percentage
        context.fillStyle = "#00d4ff"
        context.beginPath();
        context.arc(centerX, centerY, radius+thickness, 0, 2*Math.PI*percentage, false);
        context.lineTo(centerX + radius*Math.cos(2*Math.PI*percentage), centerY + radius*Math.sin(2*Math.PI*percentage));
        context.arc(centerX, centerY, radius, 2*Math.PI*percentage, 0, true);
        context.lineTo(centerX + radius+thickness, centerY);
        context.fill();
        context.closePath();

        // draw the inactive percentage
        context.fillStyle = "#FFFFFF";
        context.beginPath();
        context.arc(centerX, centerY, radius+thickness, 0, 2*Math.PI*percentage, true);
        context.lineTo(centerX + radius*Math.cos(2*Math.PI*percentage), centerY + radius*Math.sin(2*Math.PI*percentage));
        context.arc(centerX, centerY, radius, 2*Math.PI*percentage, 0, false);
        context.lineTo(centerX + radius+thickness, centerY);
        context.fill();
        context.closePath();
    }

    context.save();
    context.rotate(Math.PI/2);
    context.translate(0, -progressCircle.height);
    context.font = "30px monospace";
    context.fillText(String(Math.ceil(percentage * 100)) + "%", centerX-20, centerY+10);
    context.restore();
}


/*
 * When the download button is clicked gets '/download'
 */

function download() {
    window.location.href += "download?file=" + fileName + "&title=" + videoTitle;
}


function submitUrl() {
    let videoUrl = document.getElementById("url-field").value;
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == XMLHttpRequest.LOADING) {
            if (httpRequest.status == 200) {
                let response = httpRequest.responseText.split("\n");
                let latestResponse = JSON.parse(response.pop());

                if (latestResponse.state == "valid-url") {
                    downloadingElement.style.display = "block";
                    downloadFinishedElement.style.display = "none";
                    errorElement.style.display = "none";
                    document.getElementById("options").style.display = "none";
                    drawProgressCircle(0);
                }
                else if (latestResponse.state == "download-progress") {
                    drawProgressCircle(latestResponse.percentage);
                }
            }
            else {
                console.log("AJAX request failed");
            }
        }
        else if (httpRequest.readyState == XMLHttpRequest.DONE) {
            if (httpRequest.status == 200) {
                let response = httpRequest.responseText.split("\n");
                let latestResponse = JSON.parse(response.pop());

                if (latestResponse.state == "server-download-finished") {
                    downloadFinishedElement.style.display = "block";
                    downloadingElement.style.display = "none";
                    errorElement.style.display = "none";

                    fileName = latestResponse.fileName;
                    videoTitle = latestResponse.videoTitle;
                }
                else if (latestResponse.state == "invalid-url") {
                    errorElement.style.display = "block";
                    downloadingElement.style.display = "none";
                    downloadFinishedElement.style.display = "none";

                    errorElement.textContent = "Sorry, the url that you provided is not valid";
                }
                else if (latestResponse.state == "getInfo-error") {
                    console.log(latestResponse.info);
                    errorElement.style.display = "block";
                    downloadingElement.style.display = "none";
                    downloadFinishedElement.style.display = "none";

                    errorElement.textContent = "An error happened when trying to get video info";
                }
                else if (latestResponse.state == "download-error") {
                    console.log(latestResponse.info);
                    errorElement.style.display = "block";
                    downloadingElement.style.display = "none";
                    downloadFinishedElement.style.display = "none";

                    errorElement.textContent = "An error happened when trying to download the video";
                }
            }
            else {
                console.log("AJAX request failed");
            }
        }
    }
    httpRequest.open("POST", "/convert", true);
    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    httpRequest.send("videourl=" + videoUrl + "&format=" + optionsTabSelected);
}


/*
 *  When the button to deploy the option menu is clicked
 *  it shows or hide the option menu depending on actual state of the option menu
 */

function showOptions() {
    if (optionsTab.style.display == "none") {
        // fade in
        optionsTab.style.display = "block";
        let opacity = optionsTab.style.opacity = 0;
        deployOptionsButton.style.transform = "scale(3, 1)";
        deployOptionsButton.style.webkitTransform = "scale(3, 1)";
        let id = setInterval(() => {
            if (optionsTab.style.opacity >= 1) {
                clearInterval(id);
            }
            else {
                opacity += 0.02;
                optionsTab.style.opacity = opacity;
                deployOptionsButton.style.transform = "scale(3, " + String(1-opacity*2) + ")";
                deployOptionsButton.style.webkitTransform = "scale(3, " + String(1-opacity*2) + ")";
            }
        }, 10);
        // show the content of the tab selected
        if (optionsTabSelected == "mp3") {
            document.getElementById("tab-button-mp3").click();
        }
        else if (optionsTabSelected == "mp4") {
            document.getElementById("tab-button-mp4").click();
        }
    }
    else if (optionsTab.style.display == "block") {
        // fade out
        let opacity = optionsTab.style.opacity = 1;
        deployOptionsButton.style.transform = "scale(3, -1)";
        deployOptionsButton.style.webkitTransform = "scale(3, -1)";
        let id = setInterval(() => {
            if (optionsTab.style.opacity <= 0) {
                clearInterval(id);
                optionsTab.style.display = "none";
            }
            else {
                opacity -= 0.02;
                optionsTab.style.opacity = opacity;
                deployOptionsButton.style.transform = "scale(3, " + String(1-opacity*2) + ")";
                deployOptionsButton.style.webkitTransform = "scale(3, " + String(1-opacity*2) + ")";
            }
        }, 10);
        // hide the tab content
        let tabContent = document.getElementsByClassName("options-tab-content");
        for (let i=0; i<tabContent.length; i++) {
            tabContent[i].style.display = "none";
        }
    }
}


/*
 *  When an options tab button is clicked
 *  it shows the options tab
 *  and hides the options of the other tab
 */

function openOptionsTab(tabSelected) {
    optionsTabSelected = tabSelected;

    let tabButtonMp3 = document.getElementById("tab-button-mp3");
    let tabButtonMp4 = document.getElementById("tab-button-mp4");

    if (optionsTabSelected == "mp3") {
        tabButtonMp3.className = "active";
        tabButtonMp4.className = "";
    }
    else if (optionsTabSelected == "mp4") {
        tabButtonMp3.className = "";
        tabButtonMp4.className = "active";
    }
    
    // hide the tab content
    let tabContent = document.getElementsByClassName("options-tab-content");
    for (let i=0; i<tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    document.getElementById(optionsTabSelected).style.display = "block";
}
