const express = require("express");
const path = require("path");
const helmet = require("helmet");
const ytdl = require("ytdl-core");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const router = express.Router();

router.use(helmet())

router.get("/", (request, response) => {
    response.render("index");
});

router.post("/convert", (request, response) => {
    const videoUrl = request.body.videourl;
    const format = request.body.format;
    console.log("Video url:", videoUrl);

    if (ytdl.validateURL(videoUrl) === true) {
        console.log("The video url is valid");
        response.write(JSON.stringify({ state: "valid-url" }));
    } else {
        console.log("The video url is not valid");
        response.send(JSON.stringify({ state: "invalid-url" }));
        response.end();
        return;
    }
    
    ytdl.getInfo(videoUrl, (error, info) => {
        if (error) {
            console.log("Failed to get video info:", error);
            response.write("\n" + JSON.stringify({ state: "get-info-error", info: error }));
            response.end();
            return;
        }
    
        const filename = info.video_id + "." + format;
        console.log("Video info successfully retrieved");

        serverDownload(info, format, response);
    });
});

function serverDownload(videoInfo, format, response) {
    const videoId = videoInfo.video_id;
    const videoTitle = videoInfo.title;
    const videoLength = videoInfo.length_seconds;
    const filename = videoId + "." + format; 
    const filePath = `downloads/${filename}`;

    let readStream = ytdl(videoId);
        
    if (format == "mp3") {
        var command = downloadAudio(readStream, format);
    }
    else if (format == "mp4") {
        var command = downloadVideo(readStream, format);
    } else {
        console.log("Invalid file format");
        response.write("\n" + JSON.stringify({ state: "invalid-format-error", info: `${format} is not a valid format` }));
        response.end();
        return;
    }

    command.on("error", (error) => {
            console.log("Failed to write stream:", error);
            response.write("\n" + JSON.stringify({state: "ffmpeg-error", info: error }));
            response.end();
            fs.unlinkSync(filePath);
            return;
        })
        .on("progress", (chunk) => {
            const percentage = getLengthFromTimemark(chunk.timemark) / videoLength;
            response.write("\n" + JSON.stringify({ state: "download-progress", percentage: percentage }));
        })
        .on("end", () => {
            console.log("Video successfully downloaded");
            response.write("\n" + JSON.stringify({ state: "server-download-finished", filename: filename, videotitle: videoTitle }));
            response.end();
        })
        .save(filePath);
}

function downloadAudio(readStream, format) {
    return ffmpeg(readStream)
        .toFormat(format)
        .audioBitrate(198)
        .noVideo();
}

function downloadVideo(readStream, format) {
    return ffmpeg(readStream)
        .toFormat(format)
        .audioBitrate(198)
        .videoBitrate(1400);
}

// convert timemark format 'hh:mm:ss.dd' to its length in seconds
function getLengthFromTimemark(timemark) {
    return timemark.slice(0, -3).split(":")
        .map((currentValue, index) => (60**(2-index))*parseInt(currentValue))
        .reduce((accumulator, currentValue) => accumulator + currentValue);
}

router.get("/download", (request, response) => {
    const filename = request.query.file;  // filename is following this norm: videoId.extension ex: RandomId.mp3
    ytdl.getInfo(getVideoIdByFilename(filename), (error, info) => {
        if (error) {
            console.log("Failed to get video info :", error);
            response.write("\n" + JSON.stringify({ state: "get-info-error", info: error }));
            response.end();
            return;
        }
        const title = request.query.title.replace(/\//g, " ");      // replace every '/' in the title by ' ', to avoid error
        response.download(getPathByFilename(filename), `${title}.${getExtensionByFilename(filename)}`);
    });
});

function getVideoIdByFilename(filename) {
    return filename.split(".")[0];
}

function getExtensionByFilename(filename) {
    return filename.split(".")[1];
}

function getPathByFilename(filename) {
    return path.join("./downloads", filename);
}

module.exports = router;
