/*

The public version of the file used for testing can be found here: https://gist.github.com/ConsenSys-Academy/7d59ba6ebe581c1ffcc981469e226c6e

This test file has been updated for Truffle version 5.0. If your tests are failing, make sure that you are
using Truffle version 5.0. You can check this by running "truffle version"  in the terminal. If version 5 is not
installed, you can uninstall the existing version with `npm uninstall -g truffle` and install the latest version (5.0)
with `npm install -g truffle`.

*/
var GoodBoard = artifacts.require('GoodBoard.sol')
var SuperGood = artifacts.require('SuperGood.sol')
let catchRevert = require("./exceptionsHelpers.js").catchRevert
const BN = web3.utils.BN
//const Contract = web3.eth.Contract

contract('GoodBoard', function(accounts) {

    const deployAccount = accounts[0]
    const firstAccount = accounts[3]
    const secondAccount = accounts[4]
    const thirdAccount = accounts[5]
    const emptyAddress = '0x0000000000000000000000000000000000000000'

    const donation = "100000000000000000"
    const committee = [deployAccount, firstAccount, secondAccount]
    const addcommittee = [deployAccount, firstAccount, secondAccount, thirdAccount]
    const remcommittee = [firstAccount, secondAccount, thirdAccount]
    const committeenumber = 3
    const commreqd = 2
    const addcommreqd = 3
    const takers = [secondAccount, thirdAccount]
    const shares1 = 7
    const shares2 = 3
    const takeamount = [7, 3]
    const proposal = "My proposal is to build a portfolio"
    const proposal1 = "add an owner"
    const proposal2 = "remove an owner"
    const firstPortfolioId = 0
    const name = "Heart and Space Foundation"
    const portfolioName = "Heart Disease in space"

    let instance
    let SuperGoodInstance
    let SuperGoodAddress
    let homeAddress
    beforeEach(async () => {
        SuperGoodInstance = await SuperGood.new({from: deployAccount})
        SuperGoodAddress = await SuperGoodInstance.contract.options.address
        instance = await GoodBoard.new(committee, SuperGoodAddress, name, {from: deployAccount})
        homeAddress = await instance.contract.options.address

    })

    describe("Setup", async() => {
        it("The Commitee members should be set", async() => {
            const owner1 = await instance.owners(0)
            const owner2 = await instance.owners(1)
            const owner3 = await instance.owners(2)
            const array = [owner1, owner2, owner3]
            assert.deepEqual(array, committee, "the payees should be the ones in constructor")
        })
    })

    describe("Functions", () => {
        describe("submitTransaction()", async() =>{
            it("only members can submit a transaction", async() => {
                const data = await instance.contract.methods.build(takers,takeamount,portfolioName).encodeABI();
                const tx  = await instance.submitTransaction(homeAddress,0, data, proposal, {from: deployAccount} )
                const eventData = tx.logs[0].args
                assert.equal(eventData.transactionId, firstPortfolioId, "this should be the first transaction" )
                await catchRevert(instance.submitTransaction(homeAddress,0, data, proposal, {from: thirdAccount} ))
            })
        })

        describe("build()", async() =>{
            it("can build a portfolio successfully", async() => {
                const data = await instance.contract.methods.build(takers, takeamount, portfolioName).encodeABI()
                const reqd = await instance.required()
                assert.equal(reqd, commreqd, "required amount should equal to members div 2 plus 1" )
                await instance.submitTransaction(homeAddress,0, data, proposal, {from: deployAccount} )
                const tx  = await instance.confirmTransaction(0, {from:firstAccount})
                const eventData = tx.logs[0].args
                assert.equal(eventData.transactionId, 0, "this should be the first transaction" )
                const portfolioaddress = await instance.Portfolios(firstPortfolioId)
                assert.notEqual(portfolioaddress, emptyAddress, "should not be empty address")
            })
        })

        describe("addOwner()", async() =>{
            it("can add an owner successfully", async() => {
                const data = await instance.contract.methods.addOwner(thirdAccount).encodeABI()
                await instance.submitTransaction(homeAddress,0, data, proposal, {from: deployAccount} )
                await instance.confirmTransaction(0, {from:firstAccount})
                const reqd = await instance.required()
                assert.equal(reqd, addcommreqd, "required amount should equal to members div 2 plus 1" )
                const newowner = await instance.owners(committeenumber)
                assert.equal(newowner, thirdAccount, "should not be empty address")
            })
        })

        describe("removeOwner()", async() =>{
            it("can remove an owner successfully", async() => {
                const data = await instance.contract.methods.removeOwner(deployAccount).encodeABI()
                await instance.submitTransaction(homeAddress,0, data, proposal2, {from: firstAccount} )
                await instance.confirmTransaction(0, {from:secondAccount})
                //await instance.confirmTransaction(0, {from:thirdAccount})
                const reqd = await instance.required()
                assert.equal(reqd, commreqd, "required amount should equal to members div 2 plus 1" )
                const notowner = await instance.isOwner(deployAccount)
                assert(!notowner, "address should not be an owner")
            })
        })
    })
})