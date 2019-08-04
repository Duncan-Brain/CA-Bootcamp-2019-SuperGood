import React, {Component} from 'react';
import Layout from '../../components/Layout';
import {Table, Card, Grid, Button} from 'semantic-ui-react';
import web3 from '../../contracts/jscontracts/web3';
import SuperGood from '../../contracts/jscontracts/SuperGood';
import RequestRow from '../../components/RequestRow';
import GoodBoard from '../../contracts/jscontracts/GoodBoard';


import {Link} from '../../routes';

class MyAccountShow extends Component {
    _isMounted = false;

    state = {
            addressIWant: '',
        };

    constructor(props){
        super(props);
        this.getData();
    }

    static async getInitialProps(props){
        const accounts = await web3.eth.getAccounts();
        const defaultAccount = accounts[0];
        const {urlAddress} = props.query;
        const subscribeLength = await SuperGood.methods.getSubscribeLength(defaultAccount).call();

        let requests;
        let names;

        if(subscribeLength>0){
        requests = await Promise.all(
            Array(parseInt(subscribeLength)).fill().map((element,index) => {
                return SuperGood.methods.SubscribeLookup(defaultAccount, index).call();
            })
        );
        names = await Promise.all(
            Array(parseInt(subscribeLength)).fill().map((element,index) => {
                GoodBoard.options.address = requests[0];
                return GoodBoard.methods.name().call();
            })
        );
        } else {requests, names = ["none"]}

        return{defaultAccount, names, requests, subscribeLength};
    }

    async getData(){
        const accounts = await web3.eth.getAccounts();
        const defaultAccount = accounts[0];
        var addressIWant = defaultAccount;
        if(this._isMounted){
            this.setState({
                addressIWant:addressIWant
            });
        }
    }

    renderRows(){
        if(this.props.subscribeLength>0){
        return this.props.requests.map((request, index) => {
            return <RequestRow
                key={index}
                id={index}
                request={request}
                name={this.props.names[index]}
                subscribeLength={this.props.subscribeLength}
            />
        });
        }
        else{
            return <RequestRow
                key="0"
                id="0"
                name="N/A"
                request={this.props.requests}
                subscribeLength={this.props.subscribeLength}
            />

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

    render() {
        const {Header, Row, HeaderCell, Body} = Table

        return(
            <Layout>
                <h3>Charity List</h3>
                <div> Found {this.props.subscribeLength} Subscription(s).</div>
                <Table>
                    <Header>
                        <Row>
                            <HeaderCell>Name</HeaderCell>
                            <HeaderCell>Address</HeaderCell>
                        </Row>
                    </Header>
                    <Body>
                        {this.renderRows()}
                    </Body>
                </Table>
            </Layout>
        );
    }
}

export default MyAccountShow;