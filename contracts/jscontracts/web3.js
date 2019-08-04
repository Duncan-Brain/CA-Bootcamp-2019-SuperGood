// for help on new system https://www.toptal.com/ethereum/one-click-login-flows-a-metamask-tutorial
//https://ethereum.stackexchange.com/questions/17491/better-pattern-to-detect-web3-default-account-when-using-metamask/47744#47744
//https://ethereum.stackexchange.com/questions/61761/new-web3-method-to-request-account-access-from-dapp-browser-no-request
import Web3 from 'web3';

let web3;


    /*// Modern dapp browsers...
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            ethereum.enable();
            // Acccounts now exposed
        } catch (error) {
            // User denied account access...
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        // Acccounts always exposed

    }
    // Non-dapp browsers...
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        const provider = new Web3.providers.HttpProvider(
        'ShortTermTesterURL'
        );
        web3 = new Web3(provider);
    }*/


if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined'){
    //We are in the browser and Metamask is running
    web3 = new Web3(window.web3.currentProvider);
} else {
    //We are on the server *OR* the user is not running Metamask
    const ShortTermTesterURL = 'https://rinkeby.infura.io/v3/4a303271713f4d4eaee27da6a9e61dc7';

    const provider = new Web3.providers.HttpProvider(
        ShortTermTesterURL
    );
    web3 = new Web3(provider);
}

export default web3;