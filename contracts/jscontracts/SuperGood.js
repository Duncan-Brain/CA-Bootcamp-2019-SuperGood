import web3 from './web3';
import SuperGood from '../../build/contracts/SuperGood.json';
import portfolioAddress from './address'

//const portfolioAddress = '0x8c76888820C7acC36215EC23C10fC49EEE81fEFD';
//const portfolioAddress = '0x9757Ce3af90Ed79e327BA793bbb442bbf15388e3';

const instance = new web3.eth.Contract(SuperGood.abi, portfolioAddress);

export default instance;