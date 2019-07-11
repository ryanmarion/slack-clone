import React, { Component } from 'react'
import { Menu, Header,Icon,Button,Grid } from 'semantic-ui-react'

export default class NavMenu extends Component {
  state = {}

  render() {
    const {color} = this.props;

    return (
      <Grid verticalAlign='top'>
        <Grid.Column>
          <Menu inverted style={{'height':60,'border-radius':0,'background-color':`${color}`}}>
            <Header inverted as="h2" position='left' className="nav__header">
              <Icon name="slack hash" style={{'margin-right':0}}/>flack
            </Header>

            <Menu.Menu position='right' verticalAlign='middle'>
              <Menu.Item name='login' style={{'width':80,'margin-top':15}} onClick={this.handleItemClick}>
                <Button inverted>
                  Login
                </Button>
              </Menu.Item>

              <Menu.Item name='register' style={{'width':100,'margin-top':15,'margin-right':15}} onClick={this.handleItemClick}>
                <Button inverted>
                  Register
                </Button>
              </Menu.Item>
            </Menu.Menu>
          </Menu>
        </Grid.Column>
      </Grid>
    )
  }
}
