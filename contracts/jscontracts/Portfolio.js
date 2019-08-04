import web3 from './web3';
import Portfolio from '../../build/contracts/Portfolio.json';

const instance = new web3.eth.Contract(Portfolio.abi);

export default instance;