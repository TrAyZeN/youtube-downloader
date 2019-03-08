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
    let videoUrl = request.body.videourl;
    console.log("Video url:", videoUrl);

    if (ytdl.validateURL(videoUrl) === true) {
        console.log("The video url is valid");
        response.write(JSON.stringify({ state: "valid-url" }));

        ytdl.getInfo(videoUrl, (error, info) => {
            if (error) {
                console.log("getInfo error:", error);
                response.write("\n" + JSON.stringify({ state: "getInfo-error", info: error }));
                response.end();
            }
            let videoLength = info.length_seconds;
            let videoTitle = info.title;
            let videoId = ytdl.getURLVideoID(videoUrl);
            let format = request.body.format
            let fileName = videoId + "." + format;
            return new Promise((resolve, reject) => {
        
                fs.readdirSync("./downloads/").forEach(file => {
                    if (file == fileName) {  // TODO: do something with the file already existing
                        console.log("The file is already existing");
                    }
                });
        
                let stream = ytdl(videoId);
                let command = ffmpeg(stream)
                    .toFormat(format)
                    .audioBitrate(198)
                    .on("error", (error) => {
                        reject(error);
                    })
                    .on("progress", (chunk) => {
                        // convert timemark format 'hh:mm:ss.dd' to its length in seconds
                        let currentLength = chunk.timemark.slice(0, -3).split(":")
                            .map((currentValue, index) => (60**(2-index))*parseInt(currentValue))
                            .reduce((accumulator, currentValue) => accumulator + currentValue);
    
                        let percentage = currentLength / videoLength;
                        response.write("\n" + JSON.stringify({ state: "download-progress", percentage: percentage }));
                    })
                    .on("end", () => {
                        response.write("\n" + JSON.stringify({ state: "server-download-finished", fileName: fileName, videoTitle: videoTitle }));
                        response.end();
                    });
        
                if (format == "mp3") {
                    command.noVideo();
                }
                else if (format == "mp4") {
                    command.videoBitrate(1400);
                }
                
                command.save("downloads/" + fileName);
                resolve();
            }).catch((error) => {
                console.log("download error:", error);
                response.write("\n" + JSON.stringify({ state: "download-error", info: error }));
                response.end();
            });
        });
    }
    else {
        console.log("The video url is not valid");
        response.send(JSON.stringify({ state: "invalid-url" }));
    }
});

router.get("/download", (request, response) => {
    let fileName = request.query.file;  // filename is following this norm: videoId.format ex: RandomId.mp3
    let videoId = fileName.split(".")[0];
    ytdl.getInfo(videoId, (error, info) => {
        if (error) throw error;
        let title = info.title.replace(/\//g, " ");      // replace every '/' in the title by ' '
        let fileLocation = path.join("./downloads", fileName);
        let format = fileLocation.split(".")[1];
        response.download(fileLocation, title + "." + format);
    });
});

module.exports = router;
