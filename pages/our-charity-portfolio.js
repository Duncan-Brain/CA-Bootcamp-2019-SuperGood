import React, {Component} from 'react';
import Layout from '../components/Layout';
import {Table, Card, Grid, Button, Form, Input, Message} from 'semantic-ui-react';
import web3 from '../contracts/jscontracts/web3';
import Portfolio from '../contracts/jscontracts/Portfolio';
import RequestRow from '../components/RequestRow';

import {Link} from '../routes';

class PortfolioShow extends Component {
    _isMounted = false;

    state = {
            addressIWant: '',
            addressPortfolio: '',
            amount: '',
            loading: false,
            receivedToDate:0,
            errorMessage:''

        };

    constructor(props){
        super(props);

        this.getData();
    }

    static async getInitialProps(props){
        const {address} = '0x72daaB0807E0EAFb9B1a640f9c6B9D8D4340a189';
        Portfolio.options.address = '0x72daaB0807E0EAFb9B1a640f9c6B9D8D4340a189';
        const accounts = await web3.eth.getAccounts();
        const defaultAccount = accounts[0];
        const payeeLength = await Portfolio.methods.payeesLength().call();

        let requests;

        if(payeeLength>0){
            requests = await Promise.all(
                Array(parseInt(payeeLength)).fill().map((element,index) => {
                    return Portfolio.methods.payee(index).call()
                })
            );
        } else {requests = ["none"]}

        return{defaultAccount, requests, payeeLength, address};
    }

    static async getDerivedStateFromProps(props, state){
        const portfolioAddress = '0x72daaB0807E0EAFb9B1a640f9c6B9D8D4340a189';
        Portfolio.options.address = '0x72daaB0807E0EAFb9B1a640f9c6B9D8D4340a189';
        const accounts = await web3.eth.getAccounts();
        const defaultAccount = accounts[0];


        const payeeLength = await Portfolio.methods.payeesLength().call();

        let requests;

        if(payeeLength>0){
            requests = await Promise.all(
                Array(parseInt(payeeLength)).fill().map((element,index) => {
                    return Portfolio.methods.payee(index).call()
                })
            );
        } else {requests = ["none"]}

        return{defaultAccount, requests, payeeLength, portfolioAddress};
    }

    async getData(){
        this._isMounted = true;
        const accounts = await web3.eth.getAccounts();
        const defaultAccount = accounts[0];

        const balance = await web3.eth.getBalance('0x72daaB0807E0EAFb9B1a640f9c6B9D8D4340a189');
        const released = await Portfolio.methods.totalReleased().call();
        var addressIWant = defaultAccount;
        var addressPortfolio = this.props.address;
        var receivedToDate = (parseInt(balance) + parseInt(released));
        if(this._isMounted){
            this.setState({
                addressIWant:addressIWant,
                addressPortfolio:addressPortfolio,
                receivedToDate:receivedToDate
            });
        }
    }

    renderRows(){
        if(this.props.payeeLength>0){
        return this.props.requests.map((request, index) => {
            return <RequestRow
                key={index}
                id={index}
                request={request}
                payeeLength={this.props.payeeLength}
            />
        });
        }
        else{
            return <RequestRow
                key="0"
                id="0"
                request={this.props.requests}
                payeeLength={this.props.payeeLength}
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

    onSubmit = async (event) => {
        event.preventDefault();
        const {amount, addressPortfolio} = this.state;
        const donationWEI = amount * 1000000000000000000;
        const portfolioAddy = web3.utils.toChecksumAddress(addressPortfolio)
        this.setState({loading: true, errorMessage: ''});
        try{
            const accounts = await web3.eth.getAccounts();
            await web3.eth.sendTransaction({
                    from: accounts[0],
                    to: portfolioAddy,
                    value: donationWEI
                });
            window.location.reload();
        } catch (err) {
            this.setState({errorMessage: err.message.split("\n")[0]});
        }
        this.setState({loading: false, value:''})
    };

    render() {
        const {Header, Row, HeaderCell, Body} = Table

        return(
            <Layout>
                <h3>Charities List</h3>
                <div> Found {this.props.payeeLength} Charities.</div>
                <div> Portfolio Received {this.state.receivedToDate} Wei to Date.</div>
                <Form inverted id = 'donateForm' onSubmit = {this.onSubmit} error = {!!this.state.errorMessage}>
                <Form.Group widths = 'equal'>
                    <Form.Field id = 'amount'>
                       <Input
                           fluid
                           value = {this.state.amount}
                           placeholder = 'Donation Amount in Ether'
                           onChange = {event => this.setState({amount: event.target.value})}
                       />
                    </Form.Field>
                    <Button
                       inverted
                       fluid
                       loading = {this.state.loading}>
                    Donate
                    </Button>
                </Form.Group>
                </Form>
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
                <Message error header = "Error messages will be here!" content = {this.state.errorMessage} />
            </Layout>
        );
    }
}

export default PortfolioShow;