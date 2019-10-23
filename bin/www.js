const app = require("../app");
const debug = require("debug")("trayzen-yt-downloader:server");
const http = require("http");
const fs = require("fs");

const port = normalizePort(process.env.PORT || "3001");
app.set("port", port);

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
    clearDownloadFolder();
});
server.on("error", onError);
server.on("listening", onListening);

function clearDownloadFolder() {
	// delete every file except '.gitkeep' in the downloads directory
    fs.readdirSync("./downloads/").forEach(file => {
        if (file != ".gitkeep") fs.unlinkSync(`./downloads/${file}`);
    });
}


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    let port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
	if (error.syscall !== "listen") {
		throw error;
	}

	let bind = typeof port === "string"
		? `Pipe ${port}`
		: `Port ${port}`;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case "EACCES":
			console.error(`${bind} requires elevated privileges`);
			process.exit(1);
		break;
		case "EADDRINUSE":
			console.error(`${bind} is already in use`);
			process.exit(1);
		break;
		default:
			throw error;
	}
}


/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
	let address = server.address();
	let bind = typeof address === "string"
		? `pipe ${address}`
		: `port ${address.port}`;
	debug(`Listening on ${bind}`);
}
