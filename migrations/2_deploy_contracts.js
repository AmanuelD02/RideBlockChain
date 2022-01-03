const Ride = artifacts.require("./Ride.sol");

module.exports = function (deployer) {
  deployer.deploy(Ride);
};
