/*

The public version of the file used for testing can be found here: https://gist.github.com/ConsenSys-Academy/7d59ba6ebe581c1ffcc981469e226c6e

This test file has been updated for Truffle version 5.0. If your tests are failing, make sure that you are
using Truffle version 5.0. You can check this by running "truffle version"  in the terminal. If version 5 is not
installed, you can uninstall the existing version with `npm uninstall -g truffle` and install the latest version (5.0)
with `npm install -g truffle`.

*/
var Portfolio = artifacts.require('Portfolio.sol')
var GoodBoard = artifacts.require('GoodBoard.sol')
var SuperGood = artifacts.require('SuperGood.sol')


let catchRevert = require("./exceptionsHelpers.js").catchRevert
const BN = web3.utils.BN

contract('SuperGood', function(accounts) {

    const deployAccount = accounts[0]
    const firstAccount = accounts[3]
    const secondAccount = accounts[4]
    const thirdAccount = accounts[5]
    const emptyAddress = '0x0000000000000000000000000000000000000000'
    const committee = [deployAccount, firstAccount, secondAccount]
    const takers = [firstAccount, secondAccount]
    const takeamount = ["7", "3"]
    const proposal = "My proposal is to build a portfolio"
    const name = "Heart and Space Foundation"
    const portfolioName = "Heart Disease in space"

    let instance
    let instanceAddress
    let PortfolioInstance
    let PortfolioAddress
    let GoodBoardInstance
    let GoodBoardAddress

    beforeEach(async () => {
        instance = await SuperGood.new({from: deployAccount})
        instanceAddress = await instance.contract.options.address
        await instance.build(committee, name, {from: deployAccount})
        GoodBoardAddress = await instance.GoodBoards(0)
        GoodBoardInstance = await GoodBoard.at(GoodBoardAddress)
        const PortfolioData = await GoodBoardInstance.contract.methods.build(takers,takeamount,portfolioName).encodeABI()
        const tx1 = await GoodBoardInstance.submitTransaction(GoodBoardAddress,0, PortfolioData, proposal, {from: deployAccount} )
        const tx2 = await GoodBoardInstance.confirmTransaction(0, {from: firstAccount, gas: 6000000} )
        PortfolioAddress = await GoodBoardInstance.Portfolios(0)
        PortfolioInstance = await Portfolio.at(PortfolioAddress)
    })

    describe("Setup", async() => {

        it("OWNER should be set to the deploying address", async() => {
            const owner = await instance.owner()
            assert.equal(owner, deployAccount, "the deploying address should be the owner")
        })

        it("A GoodBoard should deployed", async() => {
            const address = await instance.GoodBoards(0)
            assert.notEqual(address, emptyAddress, "GoodBoardAddress should exist")
        })

         it("A Portfolio should be deployed", async() => {
            const address = await GoodBoardInstance.Portfolios(0)
            assert.notEqual(address, emptyAddress, "Portfolio Address should exist")
        })
    })

    describe("Functions", async() => {

        it("Should resolve subsciptions", async() => {
            const address = await instance.SubscribeLookup(deployAccount,0)
            assert.equal(address, GoodBoardAddress, "GoodBoardAddress should exist")
        })

        it("A charity can find portfolios", async() => {
            const address = await instance.CharityLookup(firstAccount,0)
            assert.equal(address, PortfolioAddress, "GoodBoardAddress should exist")
        })


    })

})