const Storage = artifacts.require("Storage");
const Logic = artifacts.require("Logic");
const Logic_EntryVersion = artifacts.require("Logic_EntryVersion");

module.exports = async function(deployer) {
  await deployer.deploy(Storage);
  await deployer.deploy(Logic, Storage.address)
  await deployer.deploy(Logic_EntryVersion, Storage.address)
};
