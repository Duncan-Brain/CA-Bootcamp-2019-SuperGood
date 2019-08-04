import React, {Component} from 'react';
import {Container, Segment, Button, Image, Divider, Checkbox, Grid} from 'semantic-ui-react';
import Layout from '../components/Layout';
import {Link} from '../routes';

class homepage extends Component {

        constructor(props) {
            super(props)
          }

        state = {
        }

        render() {
            const square = { width: 175, height: 175 }

            return (
                <Layout>
                    <Image src='static/images/my-life-through-a-lens-bq31L0jQAjU-unsplash.jpg'/>

                    <Image src='static/images/kat-yukawa-K0E6E0a0R3A-unsplash.jpg'/>

                </Layout>
            );
        }
}

export default homepage;