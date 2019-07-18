import React, { Component } from 'react';
import { Menu, Header,Icon,Button,Grid } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export default class NavMenu extends Component {
  state = {}

  render() {
    const {color} = this.props;

    return (
      <Grid verticalAlign='top'>
        <Grid.Column>
          <Menu inverted style={{'height':60,'borderRadius':0,'backgroundColor':`${color}`}}>
            <Header inverted as="h2" position='left' className="nav__header">
              <Icon name="slack hash" style={{'marginRight':0}}/>flack
            </Header>

            <Menu.Menu position='right'>
              <Menu.Item name='login' style={{'width':80,'marginTop':15}} onClick={this.handleItemClick}>
              <Link to="/login">
                <Button inverted >
                    Login
                </Button>
                </Link>
              </Menu.Item>

              <Menu.Item name='register' style={{'width':100,'marginTop':15,'marginRight':15}} onClick={this.handleItemClick}>
                  <Link to="/register">
                  <Button  inverted>
                    Register
                    </Button>
                  </Link>
              </Menu.Item>
            </Menu.Menu>
          </Menu>
        </Grid.Column>
      </Grid>
    )
  }
}
