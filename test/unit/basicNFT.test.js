const { assert } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNFT", async function () {
          let basicNFT, deployer
          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture("all")
              basicNFT = await ethers.getContract("BasicNFT", deployer)
          })

          describe("minting", async function () {
              it("should increment tokenIdCount after successfull mint", async function () {
                  const tokenId = await basicNFT.getTokenIdCount()
                  const tx = await basicNFT.mintNFT()
                  await tx.wait(1)
                  const newTokenId = await basicNFT.getTokenIdCount()
                  assert.equal(newTokenId.toString(), tokenId.add(1).toString())
              })
          })
      })
