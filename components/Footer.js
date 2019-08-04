import React from 'react';
import {Grid, Icon} from 'semantic-ui-react';

export default () => {

        return (
                <Grid columns = 'equal'>
                    <Grid.Column color = 'blue' width = {1}></Grid.Column>
                    <Grid.Column color = 'blue' >
                        <div><span><img src="../static/images/canpix.png" /><a style = {{color: 'white'}}>&nbsp; Made In Canada</a></span></div>
                        <div>Images from Unsplash.com</div>
                    </Grid.Column>
                    <Grid.Column color = 'blue'>

                    </Grid.Column>
                    <Grid.Column color = 'blue' ></Grid.Column>
                    <Grid.Column color = 'blue' >
                        <div><Icon name='envelope' /><a style = {{color: 'white'}}>duncan at ourplace.io</a></div>
                    </Grid.Column>
                    <Grid.Column color = 'blue' width = {1}></Grid.Column>
                </Grid>
        );
}