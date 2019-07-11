import React from 'react';
import './App.css';
import { Grid } from 'semantic-ui-react';
import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';
import {connect} from 'react-redux';

const App = ({currentUser,currentChannel,isPrivateChannel,userPosts,primaryColor,secondaryColor}) => (
  <Grid columns="equal" className="app" style={{background:secondaryColor}}>
    <ColorPanel
      key={currentUser && currentUser.name}
      currentUser={currentUser}
    />
    <SidePanel
      key={currentUser && currentUser.uid}
      currentUser={currentUser}
      primaryColor={primaryColor}
    />
    <Grid.Column style={{marginLeft:320}}>
      <Messages
        currentUser={currentUser}
        currentChannel={currentChannel}
        key={currentChannel && currentChannel.id}
        privateChannel={isPrivateChannel}
        primaryColor={primaryColor}
      />
    </Grid.Column>
    <Grid.Column width={2}>
      <MetaPanel
        userPosts={userPosts}
        key={currentChannel && currentChannel.name}
        currentChannel={currentChannel}
        isPrivateChannel={isPrivateChannel}
      />
    </Grid.Column>
  </Grid>
)

const mapStateToProps = state => ({
  currentUser:state.user.currentUser,
  currentChannel:state.channel.currentChannel,
  isPrivateChannel:state.channel.isPrivateChannel,
  userPosts:state.channel.userPosts,
  primaryColor:state.colors.primaryColor,
  secondaryColor:state.colors.secondaryColor
});

export default connect(mapStateToProps)(App);
