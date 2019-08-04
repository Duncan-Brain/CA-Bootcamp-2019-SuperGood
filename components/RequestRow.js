import React, {Component} from 'react';
import {Table, Button} from 'semantic-ui-react';
import web3 from '../contracts/jscontracts/web3';
import GoodBoard from '../contracts/jscontracts/GoodBoard';
import {Link} from '../routes';

class RequestRow extends Component{


    render(){
        const {Row, Cell} = Table;
        const {id, request, subscribeLength, name} = this.props;
        return (
            <Row >
                <Cell>{name}</Cell>
                <Cell>
                    <Link route ={`/committee/${request}`}>
                        <a>
                            {request}
                        </a>
                    </Link>
                </Cell>
            </Row>
        )
    }
}

export default RequestRow;