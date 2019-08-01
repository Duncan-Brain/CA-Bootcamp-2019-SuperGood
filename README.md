**SuperGood**

SuperGood is a multi-signature wallet generator that comes pre-loaded with a non-profit portfolio factory.

A non-profit portfolio on SuperGood is a collection of payable wallets held by 'charities', with the owner of the portfolio assigning shares to claim the balance of the portfolio.

The owner of the non-profit portfolio would be a committee tasked with choosing the 'charities'. 

In the future SuperGood will build an on chain Verifier to resolve addresses to specific charity and verify they are who they say they are.

_For example:_ Using SuperGood the Heart & Stroke foundation could build a portfolio of worthy 'heart health' related projects by collecting their wallets and building a SuperGood portfolio. They can proceed to advertise this portfolio and 'givers' can donate and the worthy projects can withdraw funds at their leisure.

**Other Charity Related Projects**

Existing charity related projects on the blockchain include Alice(https://alice.si/) and Giveth(https://giveth.io/). These are great projects that are looking to the future of building open and transparent charitable projects and organizations.

I don't see SuperGood as competing with these projects. In fact I think a project like SuperGood would be a good on-boarding mechanism for existing charities who are not yet ready to move to be a DAO but are interested in the blockchain and are knowledgeable about existing projects in need of funding.

While not an endorsement here are some links to existing charities with Ether wallets:

https://github.com/porobov/charities-accepting-ether, 

https://www.reddit.com/r/ethereum/comments/cel8hg/when_someone_says_crypto_is_only_for_illegal/

**Problems**
Trust: In actual fact anyone can build one of these portfolios not just charities. In the future I would propose setting up SuperGood as a consultant and educator to charities. Creating a 'Verifier' contract would allow human verification of charities and committee members for more accountability and trust. Unfortunately while maybe the easiest contract I did not leave enough time to take this extra step.

Size: The contract bytecode is long, I can improve the contract to be less heavy. I don't think it would deploy using Remix, you must use truffle migrate.
 

**How To Test:**

Setup
1. Download this Git repo
2. npm install
3. add your dev mnemonic into .secret.txt

_**So I am not sure why, but I run into an out of gas error during 1_initial_migration on my testing laptop but my development it works perfect, but I would love to know if it fails for you**_

Test
1. run ganache-cli 
2. navigate to SuperGood folder
3. run truffle compile, migrate **or**  truffle migrate --reset --network development --verbose-rpc
4. run truffle test

Front End (My Test Rinkeby Contract)
1. navigate to SuperGood folder
2. npm run dev
3. Log in to wallet on Metamask
4. In Metamask settings>security & privacy>disable privacy mode
5. Change network to Rinkeby
6. Open localhost:3000 in your browser

Front End (Your contract)
0. navigate to SuperGood folder
1. Copy SuperGood deployment address to contracts/jscontracts/address.js
2. npm run-script build
3. npm run dev
4. open Metamask
5. In Metamask settings>security & privacy>disable privacy mode
6. Change network to {insert your network here}
7. Open localhost:3000 in your browser

Note: Front End
Don't dig too deep into my Front end! The routing is no good, you may have to go back to home page and refresh for every form submission. I have yet to OOP/clean/comment it and many elements changed their functionality since I last built out last year. I had a lot of turbulence catching up with breaking changes this past week. My provider isn't injecting without Metamask, what a mess. Thanks!