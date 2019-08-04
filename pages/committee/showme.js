import React, {Component} from 'react';
import Layout from '../../components/Layout';
import {Table, Form, Input, Card, Grid, Button, Message, Container} from 'semantic-ui-react';
import web3 from '../../contracts/jscontracts/web3';
import GoodBoard from '../../contracts/jscontracts/GoodBoard';
import RequestRow from '../../components/RequestRow-portfolio';
import RequestRowM from '../../components/RequestRow-members';
import RequestRowMo from '../../components/RequestRows-motions';
//import Dashboard from '../../components/Dashboard';

import {Link} from '../../routes';

class CommitteeShow extends Component {
    _isMounted = false;

    state = {
            addressIWant: '',
            addressBoard: '',
            isOwner: false,
            transactionCount:'',
            charities:'',
            shares:'',
            portfolioName:'',
            proposal:'',
            motionid:'',
            loading: false,
            loading2: false,
            errorMessage:'',
            errorMessage2:'',
        };

    constructor(props, state){
        super(props);

        this.getData();
    }

    static async getInitialProps(props){
        const {address} = props.query;
        GoodBoard.options.address = address;
        const accounts = await web3.eth.getAccounts();
        const defaultAccount = accounts[0];

        const ownerStatus = await GoodBoard.methods.isOwner(defaultAccount).call();

        const portfoliosLength = await GoodBoard.methods.getPortfoliosLength().call();

        //const members = await GoodBoard.methods.getOwners().call();
        //const memberslength = members.length;
        const membersLength = await GoodBoard.methods.getOwnerCount().call()
        window.console.log(membersLength);
        const numberProposalTransactions = await GoodBoard.methods.transactionCount().call()
        let proposalTransactions;
        let confirmations;
        let members;
        let requests;

        members = await Promise.all(
            Array(parseInt(membersLength)).fill().map((element,index) => {
                return GoodBoard.methods.owners(index).call();
            })
        );

        if(portfoliosLength>0){
        requests = await Promise.all(
            Array(parseInt(portfoliosLength)).fill().map((element,index) => {
                return GoodBoard.methods.Portfolios(index).call();
            })
        );
        } else {requests = ["none"]}
        if(ownerStatus){
            if(numberProposalTransactions>0){
                proposalTransactions = await Promise.all(
                    Array(parseInt(numberProposalTransactions)).fill().map((element,index) => {
                        return GoodBoard.methods.motions(index).call();
                    })
                );
               confirmations = await Promise.all(
                    Array(parseInt(numberProposalTransactions)).fill().map((element,index) => {
                        return GoodBoard.methods.getConfirmationCount(index).call();
                    })
                );
            } else {requests, proposalTransactions, confirmations = ["none"]}
        }

        return{defaultAccount, requests, portfoliosLength, members, membersLength, address, ownerStatus, proposalTransactions, confirmations, numberProposalTransactions};

    }

    async getData(){
        this._isMounted = true;
        const accounts = await web3.eth.getAccounts();
        const defaultAccount = accounts[0];
        var ownerStatus = await GoodBoard.methods.isOwner(defaultAccount).call();
        var addressIWant = defaultAccount;
        var addressBoard = this.props.address;
        if(this._isMounted){
            this.setState({
                addressIWant:addressIWant,
                addressBoard:addressBoard,
                isOwner:ownerStatus,
            });
        }


    }

    renderMembers(){
        if(this.props.memberslength>0){
        return this.props.members.map((member, index) => {
            return <RequestRowM
                key={index}
                id={index}
                name = "name here"
                request={this.props.members[index]}
                portfolioLength={this.props.memberslength}
            />
        });
        }
        else{
            return <RequestRowM
                key="0"
                id="0"
                name = "name here"
                request="None"
                portfolioLength="N/A"
            />

        }
    }

    renderRows(){
        if(this.props.portfoliosLength>0){
        return this.props.requests.map((request, index) => {
            return <RequestRow
                key={index}
                id={index}
                name = "name here"
                request={request}
                portfolioLength={this.props.portfoliosLength}
            />
        });
        }
        else{
            return <RequestRow
                key="0"
                id="0"
                name="N/A"
                request={this.props.requests}
                portfoliosLength={this.props.portfoliosLength}
            />

        }
    }

    renderDashboard(){

        /*let code;
                if(this.state.isOwner){
                    code = (<div>{this.renderRowsMo}</div>)
                }else { code = (<div> If you were a Board member, this is where other stuff would be </div>)}*/
        if(this.state.isOwner){
            if(this.props.numberProposalTransactions>0){
            return this.props.proposalTransactions.map((request, index) => {
                return <RequestRowMo
                    key={index}
                    id={index}
                    request = {request}
                    confirmations = {this.props.confirmations[index]}
                />
            });
            }
            else{
                return <RequestRowMo
                    key="0"
                    id="0"
                    request = "no motions"
                    confirmations = "N/A"
                />

            }
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

            const stringy1 = this.state.charities.split(",");
            const stringy2 = this.state.shares.split(",");
            const encodedbuild = await GoodBoard.methods.build(stringy1,stringy2,this.state.portfolioName).encodeABI();
            const encodedTransaction = await GoodBoard.methods.submitTransaction(this.props.address,0,encodedbuild,this.state.proposal).encodeABI();

            this.setState({loading: true, errorMessage: ''});
            try{
                const accounts = await web3.eth.getAccounts();
                await web3.eth.sendTransaction({
                    from: accounts[0],
                    to: this.props.address,
                    data: encodedTransaction,
                    gas: 5000000,
                });

                //await GoodBoard.methods.submitTransaction(this.props.address,0,encodedData,this.state.proposal)
            } catch (err) {
                this.setState({errorMessage: err.message.split("\n")[0]});
            }
            this.setState({loading: false, value:''})
        };

    onSubmitVote = async (event) => {
        event.preventDefault();

        const encodedTransaction = await GoodBoard.methods.confirmTransaction(this.state.motionid).encodeABI();

        this.setState({loading: true, errorMessage: ''});
        try{
            const accounts = await web3.eth.getAccounts();
            await web3.eth.sendTransaction({
                from: accounts[0],
                to: this.props.address,
                data: encodedTransaction,
                gas: 5000000,
            });

            //await GoodBoard.methods.submitTransaction(this.props.address,0,encodedData,this.state.proposal)
        } catch (err) {
            this.setState({errorMessage2: err.message.split("\n")[0]});
        }
        this.setState({loading2: false, value:''})
    };

    render() {
        const {Header, Row, HeaderCell, Body} = Table;


        return(
            <Layout>
            <h3>Admin: Portfolio Proposal Builder</h3>
                <Form inverted id = 'buildportfolioform' onSubmit = {this.onSubmit} error = {!!this.state.errorMessage}>
                    <Form.Group widths = 'equal'>
                        <Form.Field id = 'arrayofcharities'>
                           <Input
                               fluid
                               value = {this.state.charities}
                               placeholder = 'Comma seperated list of Charity addresses address1,address2'
                               onChange = {event => this.setState({charities: event.target.value})}
                           />
                        </Form.Field>
                        <Form.Field id = 'arrayofshares'>
                           <Input
                               fluid
                               value = {this.state.shares}
                               placeholder = 'Comma seperated list respective shares shares1,shares2'
                               onChange = {event => this.setState({shares: event.target.value})}
                           />
                        </Form.Field>
                        <Form.Field id = 'committeename'>
                           <Input
                               fluid
                               value = {this.state.portfolioName}
                               placeholder = 'Enter a name here'
                               onChange = {event => this.setState({portfolioName: event.target.value})}
                           />
                        </Form.Field>
                        <Form.Field>
                           <Input
                               fluid
                               value = {this.state.proposal}
                               placeholder = 'Enter proposal description here'
                               onChange = {event => this.setState({proposal: event.target.value})}
                           />
                        </Form.Field>
                        <Button
                           inverted
                           fluid
                           loading = {this.state.loading}>
                        Submit Portfolio Proposal
                        </Button>
                    </Form.Group>
                </Form>
                <Message error header = "Error messages will be here!" content = {this.state.errorMessage} />
                <h3>Portfolio List</h3>
                <div> Found {this.props.portfoliosLength} Portfolios.</div>

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
                <h3>Admin: Vote On Motions</h3>
                <Form inverted id = 'voteform' onSubmit = {this.onSubmitVote} error = {!!this.state.errorMessage2}>
                    <Form.Group widths = 'equal'>
                        <Form.Field id = 'motionid'>
                           <Input
                               fluid
                               value = {this.state.motionid}
                               placeholder = 'Motion ID Number'
                               onChange = {event => this.setState({motionid: event.target.value})}
                           />
                        </Form.Field>
                        <Button
                           inverted
                           fluid
                           loading = {this.state.loading2}>
                        Vote On Motion
                        </Button>
                    </Form.Group>
                </Form>
                <Message error header = "Error messages will be here!" content = {this.state.errorMessage2} />
                <h3>Motions List</h3>
                <div> Found {this.props.numberProposalTransactions} Motions.</div>
                <Container style = {{maxWidth: "100%" }}>
                    <Table celled>
                        <Header>
                            <Row>
                                <HeaderCell>Proposal ID</HeaderCell>
                                <HeaderCell>Proposal Details</HeaderCell>
                                <HeaderCell>Transaction Approved + Complete</HeaderCell>
                                <HeaderCell># of Confirmations</HeaderCell>
                                <HeaderCell>Transaction Destination</HeaderCell>
                                <HeaderCell>Eth Value</HeaderCell>
                                <HeaderCell>Bytecode Data</HeaderCell>
                                <HeaderCell>Transaction Complete</HeaderCell>
                            </Row>
                        </Header>
                        <Body>
                            {this.renderDashboard()}
                        </Body>
                    </Table>
                </Container>

                <h3>Board Members List</h3>
                <div> Found {this.props.memberslength} Members.</div>
               <Table>
                    <Header>
                        <Row>
                            <HeaderCell>Name</HeaderCell>
                            <HeaderCell>Address</HeaderCell>
                        </Row>
                    </Header>
                    <Body>
                        {this.renderMembers()}
                    </Body>
                </Table>

            </Layout>
        );
    }
}

export default CommitteeShow;