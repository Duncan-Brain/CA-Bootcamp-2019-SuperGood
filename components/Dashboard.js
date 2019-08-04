import React, {Component} from 'react';
import {Card, Image, Icon, Button, Form, Input, Message, Checkbox, Segment} from 'semantic-ui-react';

import web3 from '../contracts/jscontracts/web3';
import GoodBoard from '../contracts/jscontracts/GoodBoard';
import RequestRow from './RequestRows-motions';

class Dashboard extends Component{

    state = {
        errorMessage: '',
        transactionCount: '',
    };

    constructor(props){
        super(props);
        this.getData();
    }

    async getData(){

        const numberMotions = await GoodBoard.methods.transactionCount().call()
        let motions;
        let confirmations;

        if(portfoliosLength>0){
            motions = await Promise.all(
                Array(parseInt(numberMotions)).fill().map((element,index) => {
                    return GoodBoard.methods.motions(index).call();
                })
            );
            confirmations = await Promise.all(
                Array(parseInt(numberMotions)).fill().map((element,index) => {
                    return GoodBoard.methods.getConfirmationCount(index).call();
                })
            );
        } else {motions = ["none"]}

        return {motions, confirmations, numberMotions}

    }

    renderRows(){
        if(this.props.numberMotions>0){
        return this.props.motions.map((request, index) => {
            return <RequestRow
                key={index}
                id={index}
                confirmations = {this.props.confirmations[index]}
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

    render(){


        return (

                {this.renderRows()}

        );

    }

}
export default Dashboard;