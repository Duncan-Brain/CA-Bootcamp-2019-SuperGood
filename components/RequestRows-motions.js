import React, {Component} from 'react';
import {Table, Button, Container} from 'semantic-ui-react';


import {Link} from '../routes';

class RequestRow extends Component{


    render(){
        const {Row, Cell} = Table;
        const {id, request, confirmations} = this.props;
        return (
            <Row >
                <Cell>{id}</Cell>
                <Cell>{request.proposal}</Cell>
                <Cell>{request.executed}</Cell>
                <Cell>{confirmations}</Cell>
                <Cell>{request.destination}</Cell>
                <Cell>{request.value}</Cell>
                <Cell>{request.data}</Cell>
            </Row>
        )
    }
}

export default RequestRow;