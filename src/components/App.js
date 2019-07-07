import React from 'react';
import './App.css';
import { Grid } from 'semantic-ui-react';
import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';
import {connect} from 'react-redux';

const App = ({currentUser,currentChannel,isPrivateChannel,userPosts}) => (
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
        privateChannel={isPrivateChannel}
      />
    </Grid.Column>
    <Grid.Column width={4}>
      <MetaPanel
        userPosts={userPosts}
        key={currentChannel && currentChannel.id}
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
  userPosts:state.channel.userPosts
});

export default connect(mapStateToProps)(App);
