import React from 'react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import { Segment, Comment} from 'semantic-ui-react';
import firebase from '../../firebase';
import Message from './Message';

export default class Messages extends React.Component {
  state = {
      isPrivateChannel:this.props.privateChannel,
      privateMessagesRef:firebase.database().ref('privateMessages'),
      messagesRef:firebase.database().ref('messages'),
      channel:this.props.currentChannel,
      user:this.props.currentUser,
      messages:[],
      messsagesLoading:true,
      progressBar:false,
      numUniqueUsers:'',
      searchTerm:'',
      searchLoading:false,
      searchResults:[]
  }

  componentDidMount(){
    const { channel, user } = this.state;

    if(channel && user){
      this.addListeners(channel.id)
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId);
  }

  addMessageListener = channelId => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(channelId).on('child_added', snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages:loadedMessages,
        messsagesLoading:false
      });
      this.countUniqueUsers(loadedMessages);
    })
  };

  getMessagesRef = () => {
    const {messagesRef,privateMessagesRef,isPrivateChannel} = this.state;
    return isPrivateChannel ? privateMessagesRef : messagesRef;
  }

  handleSearchChange = e => {
    this.setState({
      searchTerm:e.target.value,
      searchLoading:true
    },() => this.handleSearchMessages());
  }

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm,'gi');
    const searchResults = channelMessages.reduce((acc,message) => {
      if (message.content && (message.content.match(regex) || message.user.name.match(regex))){
        acc.push(message);
      }
      return acc;
    },[]);
    this.setState({ searchResults });
    setTimeout(()=> this.setState({ searchLoading:false}),1000);
  }

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc,message)=>{
      if(!acc.includes(message.user.name)){
        acc.push(message.user.name);
      }
      return acc;
    },[]);
    const plural = uniqueUsers.length > 1 || uniqueUsers.legnth ===0;
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's':''}`;
    this.setState({numUniqueUsers});
  }

  displayMessages = messages => (
    messages.length > 0 && messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ))
  )

  isProgressBarVisible = percent => {
    if(percent > 0){
      this.setState({ progressBar : true});
    }
  }

  displayChannelName = channel => {
    return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : '';
  }

  render(){
    const {messagesRef,channel,user,messages,progressBar,numUniqueUsers,
      searchTerm,searchResults,searchLoading,isPrivateChannel} = this.state;

    return (
      <React.Fragment>
        <MessagesHeader
          handleSearchChange={this.handleSearchChange}
          numUniqueUsers={numUniqueUsers}
          channelName={this.displayChannelName(channel)}
          searchLoading={searchLoading}
          isPrivateChannel={isPrivateChannel}
        />

        <Segment>
          <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
            {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
          isPrivateChannel={isPrivateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}
