import React, {Component} from 'react';
import {Container, Form, Input, Segment, Button, Image, Divider, Checkbox, Grid, Message} from 'semantic-ui-react';
import Layout from '../components/Layout';
import {Link} from '../routes';
import SuperGood from '../contracts/jscontracts/SuperGood.js';
import web3 from '../contracts/jscontracts/web3';
import portfolioAddress from '../contracts/jscontracts/address';

class homepage extends Component {

    _isMounted = false;

    constructor(props) {
        super(props)

        this.getData()
      }

    state = {
        addressIWant: '',
        errorMessage:'',
        owners: '',
        loading: false,
        amount: '',
        committeeName:''

    }

    static async getInitialProps(props){

        const accounts = await web3.eth.getAccounts();
        const defaultAccount = accounts[0];

        return{defaultAccount};
    }

    async getData(){
        this._isMounted = true;
        const accounts = await web3.eth.getAccounts();
        const defaultAccount = accounts[0];

        var addressIWant = defaultAccount;

        if(this._isMounted){
            this.setState({
                addressIWant:addressIWant,

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

    onSubmit = async (event) => {
        event.preventDefault();
        const {amount} = this.state;
        const stringy = this.state.owners.split(",");
        const encodedData = await SuperGood.methods.build(stringy,this.state.committeeName).encodeABI();

        this.setState({loading: true, errorMessage: ''});
        try{
            const accounts = await web3.eth.getAccounts();

            await web3.eth.sendTransaction({
                from: accounts[0],
                to: portfolioAddress,
                data: encodedData
            });
        } catch (err) {
            this.setState({errorMessage: err.message.split("\n")[0]});
        }
        this.setState({loading: false, value:''})
    };

        render() {


            return (
                <Layout>
                    <Form inverted id = 'buildcommitteeform' onSubmit = {this.onSubmit} error = {!!this.state.errorMessage}>
                        <Form.Group widths = 'equal'>
                            <Form.Field id = 'arrayofowners'>
                               <Input
                                   fluid
                                   value = {this.state.ammount}
                                   placeholder = 'Comma seperated list of Owners address1,address2'
                                   onChange = {event => this.setState({owners: event.target.value})}
                               />
                            </Form.Field>
                            <Form.Field id = 'committeename'>
                               <Input
                                   fluid
                                   value = {this.state.committeeName}
                                   placeholder = 'Enter a name here'
                                   onChange = {event => this.setState({committeeName: event.target.value})}
                               />
                            </Form.Field>
                            <Button
                               inverted
                               fluid
                               loading = {this.state.loading}>
                            Build Your Committee
                            </Button>
                        </Form.Group>
                    </Form>
                        <Message error header = "Error messages will be here!" content = {this.state.errorMessage} />
                </Layout>
            );
        }
}

export default homepage;