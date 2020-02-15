const ytdl = require("ytdl-core");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const logger = require("../utils/logger.js");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const convert = async (request, response) => {
    const videoUrl = request.body.videourl;
    const format = request.body.format;
    logger.info(`video url: ${videoUrl}`);

    if (ytdl.validateURL(videoUrl) === true) {
        logger.info("valid url");
        response.write(JSON.stringify({ state: "valid-url" }));
    } else {
        logger.error("invalid url");
        response.send(JSON.stringify({ state: "invalid-url" }));
        response.end();
        return;
    }

    try {
        var info = await getInfo(videoUrl);
        logger.info("info retrieved");
    }
    catch (error) {
        logger.error(`failed to get info: ${error}`);
        response.write("\n" + JSON.stringify({ state: "get-info-error", info: error }));
        response.end();
    }

    serverDownload(info, format, response);
}

function getInfo(url) {
    return new Promise((resolve, reject) => {
        ytdl.getBasicInfo(url, (error, info) => {
            if (error)
                reject(error);

            resolve(info);
        });
    });
}

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
        logger.error("invalid file format");
        response.write("\n" + JSON.stringify({ state: "invalid-format-error", info: `${format} is not a valid format` }));
        response.end();
        return;
    }

    command.on("error", (error) => {
            logger.error(`failed to write stream: ${error}`);
            response.write("\n" + JSON.stringify({state: "ffmpeg-error", info: error }));
            response.end();
            if (fs.existsSync(filePath))
                fs.unlinkSync(filePath);
            return;
        })
        .on("progress", (chunk) => {
            const percentage = getLengthFromTimemark(chunk.timemark) / videoLength;
            response.write("\n" + JSON.stringify({ state: "download-progress", percentage: percentage }));
        })
        .on("end", () => {
            logger.info("video downloaded");
            response.write("\n" + JSON.stringify({ state: "server-download-finished", filename: filename, videotitle: videoTitle }));
            response.end();
        });

    command.save(filePath);
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
        .map((currentValue, index) => (60**(2-index)) * parseInt(currentValue))
        .reduce((accumulator, currentValue) => accumulator + currentValue);
}

module.exports = convert;
