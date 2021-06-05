const http = require('http');
const app = require('./app');
var Web3 = require("web3");
const method = require("./functions/blockchain");
const GracefulShutdownManager = require("@moebius/http-graceful-shutdown").GracefulShutdownManager;

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const shutdownManager = new GracefulShutdownManager(server);
server.listen(port);
process.on("SIGTERM", () => {
    shutdownManager.terminate(() => {
        console.log("Server is gracefully terminated");
    });
}); 
method.blockchainMethods.start();
