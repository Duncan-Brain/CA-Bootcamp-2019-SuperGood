/*

The public version of the file used for testing can be found here: https://gist.github.com/ConsenSys-Academy/7d59ba6ebe581c1ffcc981469e226c6e

This test file has been updated for Truffle version 5.0. If your tests are failing, make sure that you are
using Truffle version 5.0. You can check this by running "truffle version"  in the terminal. If version 5 is not
installed, you can uninstall the existing version with `npm uninstall -g truffle` and install the latest version (5.0)
with `npm install -g truffle`.

*/
var Portfolio = artifacts.require('Portfolio')
var GoodBoard = artifacts.require('GoodBoard.sol')
var SuperGood = artifacts.require('SuperGood.sol')
let catchRevert = require("./exceptionsHelpers.js").catchRevert
const BN = web3.utils.BN

contract('Portfolio', function(accounts) {

    const deployAccount = accounts[0]
    const firstAccount = accounts[3]
    const secondAccount = accounts[4]
    const thirdAccount = accounts[5]
    const emptyAddress = '0x0000000000000000000000000000000000000000'

    const committee = [deployAccount, firstAccount, secondAccount]
    const donation = 100000000000000000
    const takers = [firstAccount, secondAccount]
    const takers2 = [secondAccount, thirdAccount]
    const shares1 = 7
    const shares2 = 3
    const takeamount = ["7", "3"]
    const name = "Heart and Space Foundation"
    const portfolioName = "Heart Disease in space"

    let instance
    let instanceAddress
    let SuperGoodInstance
    let SuperGoodAddress
    let GoodBoardInstance
    let GoodBoardAddress
    beforeEach(async () => {
        SuperGoodInstance = await SuperGood.new({from: deployAccount})
        SuperGoodAddress = await SuperGoodInstance.contract.options.address

        instance = await Portfolio.new(takers, takeamount, SuperGoodAddress, portfolioName, {from: deployAccount, value: donation})
        instanceAddress = await instance.contract.options.address
    })

    describe("Setup", async() => {

        it("OWNER should be set to the deploying address", async() => {
            const owner = await instance.owner()
            assert.equal(owner, deployAccount, "the deploying address should be the owner")
        })

        it("The Payees should be set, and shares correct", async() => {
            const account1 = await instance.payee(0)
            const account2 = await instance.payee(1)
            const amount1 = await instance.shares(firstAccount)
            const amount2 = await instance.shares(secondAccount)
            //assert.deepEqual(array, takers, "the payees should be the ones in constructor")
            assert.equal(account1, firstAccount, "account 1 should have shares1")
            assert.equal(account2, secondAccount, "account 2 should have shares2")
            assert.equal(amount1, shares1, "account 1 should have shares1")
            assert.equal(amount2, shares2, "account 2 should have shares2")
        })

        it("Should be able to contribute", async() => {
            const balance1 = await web3.eth.getBalance(instanceAddress)
            await instance.sendTransaction({from:deployAccount, value: donation})
            const balance2 = await web3.eth.getBalance(instanceAddress)
            assert.equal(balance2-balance1, donation, "the amount should be correct ")
        })
    })

    describe("Functions", () => {
        describe("release()", async() =>{
            it("only accounts with shares can be released", async() => {
                const tx = await instance.release(firstAccount, {from: deployAccount} )
                const eventData = tx.logs[0].args
                assert.equal(eventData.to, firstAccount, "the person released account should be the account" )
                assert.equal(eventData.amount, (donation * shares1)/(shares1 + shares2), "the amount should be correct ")
                await catchRevert(instance.release(deployAccount, {from: firstAccount}))
            })
        })

        describe("reconstructor()", async() =>{
            it("Only owner can reconstruct, should be able to see reconstructor event emitted", async() => {
                await instance.reconstructor(takers2, takeamount, {from:deployAccount})
                /*const eventData = tx.logs[3].args
                assert.deepEqual(eventData.payees, takers2, "the new payees should be set" )*/
                const account1 = await instance.payee(0)
                const account2 = await instance.payee(1)
                const amount1 = await instance.shares(secondAccount)
                const amount2 = await instance.shares(thirdAccount)
                assert.equal(account1, secondAccount, "account 1 should have shares1")
                assert.equal(account2, thirdAccount, "account 2 should have shares2")
                assert.equal(amount1, shares1, "account 1 should have shares1")
                assert.equal(amount2, shares2, "account 2 should have shares2")
                await catchRevert(instance.reconstructor(takers, takeamount, {from: firstAccount}))
            })

            it("Escrow emits, total escrow is donation", async() => {
                const tx = await instance.reconstructor(takers2, takeamount, {from:deployAccount})
                const eventData = tx.logs[0].args
                assert.deepEqual(eventData.payees, takers, "the old payees are emitted" )
                const totalEscrowed = await instance.totalEscrow()
                assert.equal(totalEscrowed, donation, "the total amount this cycle is escrowed" )
            })

            it("only accounts with shares or escrow can be released", async() => {
                await instance.reconstructor(takers2, takeamount, {from:deployAccount})
                const individualescrow = await instance.escrow(firstAccount)
                const goneshares = await instance.shares(firstAccount)
                assert.equal(individualescrow, (donation * shares1)/(shares1 + shares2), "amount owed has been escrowed")
                assert.equal(goneshares, 0, "account should no longer have shares")
                const tx = await instance.release(firstAccount, {from: deployAccount} )
                const eventData = tx.logs[0].args
                assert.equal(eventData.to, firstAccount, "the person released account should be the account" )
                assert.equal(eventData.amount, (donation * shares1)/(shares1 + shares2), "the amount should be correct ")
            })
        })

        describe("migrate()", async() =>{
            it("Only owner can migrate, should be able to see event emitted", async() => {
                const tx = await instance.migratePayee(firstAccount, thirdAccount, {from:deployAccount})
                const migrateshares = await instance.shares(thirdAccount)
                assert.equal(migrateshares, shares1, "shares should now be available to new account")
                const eventData = tx.logs[0].args
                assert.equal(eventData.from, firstAccount, "the old payee should be gone" )
                assert.equal(eventData.to, thirdAccount, "the new payee should be set" )
                await catchRevert(instance.migratePayee(thirdAccount, secondAccount, {from:secondAccount}))
            })
        })
    })
})