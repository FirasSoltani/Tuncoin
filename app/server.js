const http = require('http');
const app = require('./app');
var Web3 = require("web3");
const GracefulShutdownManager = require("@moebius/http-graceful-shutdown").GracefulShutdownManager;
var metaCoinArtifact = require("../build/contracts/TuniCoin.json");
const blockchainConfig = require('./config');

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const shutdownManager = new GracefulShutdownManager(server);
server.listen(port);
blockchainConfig.start();
process.on("SIGTERM", () => {
    shutdownManager.terminate(() => {
        console.log("Server is gracefully terminated");
    });
}); 
