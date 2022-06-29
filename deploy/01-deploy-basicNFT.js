const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("----------------------------------------------------------")

    const args = []

    // deploy //

    const basicNFT = await deploy("BasicNFT", {
        from: deployer,
        arguments: args,
        log: true,
        waitConfirmation: network.config.blockConfirmations || 1,
    })

    // verify //

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying contract...")
        await verify(basicNFT.address, args)
    }
    log("----------------------------------------------------------")
}

module.exports.tags = ["all", "BasicNFT"]
