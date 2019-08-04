import React, {Component} from 'react';
import {Link} from '../routes';
import {Menu, Button, Dropdown, Checkbox, Input} from 'semantic-ui-react';
import web3 from '../contracts/jscontracts/web3';

class Header extends Component{
    _isMounted = false;

    state = {
            addressIWant: ''
        };

    constructor(props){
        super(props);
        this.getData();
    }

    async getData(){
        this._isMounted = true;
        const accounts = await web3.eth.getAccounts();
        const defaultAccount = accounts[0];
        var addressIWant = defaultAccount;
        if(this._isMounted){
            this.setState({
                addressIWant:addressIWant
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
          const accounts = web3.eth.getAccounts()
          const defaultAccount = accounts[0];
          if (nextState.defaultAccount !== this.state.addressIWant) {
            this.getData()
            return true;
          }
          else{return false;}
       }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render(){

        return (
                <Menu text inverted color = 'blue' style = {{marginTop:'10px'}}>
                    <Menu.Item ><Link route = "/"><a>SUPERGOOD</a></Link></Menu.Item>
                    <Menu.Item>
                        <Link route ={`/account/${this.state.addressIWant}`}>
                            <a>
                                | &nbsp;MyAccount
                            </a>
                        </Link>
                    </Menu.Item>
                    <Menu.Item>
                        <Link route ={`/build-committee`}>
                            <a>
                                | &nbsp;Build A Committee
                            </a>
                        </Link>
                    </Menu.Item>

                    <Menu.Menu position = 'right'>
                        <Menu.Item>
                            <Link route ={`/our-charity-portfolio`}>
                                <a>
                                    Our Charity Portfolio &nbsp;|
                                </a>
                            </Link>
                        </Menu.Item>
                        <Menu.Item>
                            <Input icon='search' placeholder='Explore Charity Topics...' />
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
        );
    }
}

export default Header;