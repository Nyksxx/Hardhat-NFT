const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadtoPinata")
const { verify } = require("../utils/verify")

const imagesLocation = "./images/randomNFT"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}

const FUND_AMOUNT = ethers.utils.parseEther("0.1")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let tokenUris = [
        "ipfs://QmNNs1BYet3YbB1fJ87FaWNAvASc9xMYi8ko9WTUXjdRQH",
        "ipfs://QmPK1wuu4PrAMdeLAJmjiAa7ngx3DWQevRDiAaWXJVBRm9",
        "ipfs://QmcRBSYHBPyoWmZa8sDs9NRkYZZ3KrZtYok3zvxBCsRmzE",
    ]

    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    log("----------------------------------------------------------")

    let VRFCoordinatorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        VRFCoordinatorV2Address = VRFCoordinatorV2Mock.address
        const tx = await VRFCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        VRFCoordinatorV2Address = networkConfig[chainId].vrfCoordinator
        subscriptionId = networkConfig[chainId].subscriptionId
    }
    log("----------------------------------------------------------")

    //await storeImages(imagesLocation)

    const args = [
        VRFCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId]["gasLane"],
        networkConfig[chainId]["mintFee"],
        networkConfig[chainId]["callbackGasLimit"],
        tokenUris,
    ]

    const randomIpfsNFT = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("----------------------------------------------------------")

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(randomIpfsNFT.address, args)
    }
}

async function handleTokenUris() {
    tokenUris = []

    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (imageUploadResponseIndex in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "")
        tokenUriMetadata.description = `Adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`uploading ${tokenUriMetadata.name}....`)

        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token URIs uploaded! They are:")
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]
