const Storage = artifacts.require("Storage");
const Logic = artifacts.require("Logic");

module.exports = async function(deployer) {
  await deployer.deploy(Storage);
  await deployer.deploy(Logic, Storage.address)
};
