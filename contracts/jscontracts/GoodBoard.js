import web3 from './web3';
import GoodBoard from '../../build/contracts/GoodBoard.json';

const instance = new web3.eth.Contract(GoodBoard.abi);

export default instance;

