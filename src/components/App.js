import React from 'react';
import './App.css';
import { Grid } from 'semantic-ui-react';
import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';
import {connect} from 'react-redux';

const App = ({currentUser,currentChannel}) => (
  <Grid columns="equal" className="app" style={{background:'#eee'}}>
    <ColorPanel />
    <SidePanel
      key={currentUser && currentUser.uid}
      currentUser={currentUser}
    />
    <Grid.Column style={{marginLeft:320}}>
      <Messages
        currentUser={currentUser}
        currentChannel={currentChannel}
        key={currentChannel && currentChannel.id}
      />
    </Grid.Column>
    <Grid.Column width={4}>
      <MetaPanel />
    </Grid.Column>
  </Grid>
)

const mapStateToProps = state => ({
  currentUser:state.user.currentUser,
  currentChannel:state.channel.currentChannel
})

export default connect(mapStateToProps)(App);
