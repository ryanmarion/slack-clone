import React from 'react';
import MessagesHeader from './MessagesHeader';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions';
import MessageForm from './MessageForm';
import { Segment, Comment} from 'semantic-ui-react';
import firebase from '../../firebase';
import Message from './Message';
import Typing from './Typing';
import Skeleton from './Skeleton';

class Messages extends React.Component {
  state = {
      isPrivateChannel:this.props.privateChannel,
      privateMessagesRef:firebase.database().ref('privateMessages'),
      messagesRef:firebase.database().ref('messages'),
      usersRef:firebase.database().ref('users'),
      channel:this.props.currentChannel,
      isChannelStarred:false,
      user:this.props.currentUser,
      messages:[],
      messagesLoading:true,
      progressBar:false,
      numUniqueUsers:'',
      searchTerm:'',
      searchLoading:false,
      searchResults:[],
      typingRef:firebase.database().ref('typing'),
      typingUsers:[],
      connectedRef:firebase.database().ref('.info/connected'),
      listeners:[]
  }

  componentDidMount(){
    const { channel, user, listeners } = this.state;

    if(channel && user){
      this.removeListeners(listeners);
      this.addListeners(channel.id);
      this.addUserStarsListener(channel.id,user.uid);
    }
  }

  componentDidUpdate(prevProps,prevState){
    if(this.messagesEnd){
      this.scrollToBottom();
    }
  };

  componentWillUnmount(){
    this.removeListeners(this.state.listeners);
    this.state.connectedRef.off();
  };

  removeListeners = listeners => (
    listeners.forEach(listener => {
      listener.ref.child(listener.id).off(listener.e);
    })
  );

  addToListeners = (id,ref,e) => {
    const index = this.state.listeners.findIndex(listener => {
      return listener.id === id && listener.ref === ref && listener.e === e;
    })

    if(index === -1){
      const newListener = { id, ref, e };
      this.setState({listeners:this.state.listeners.concat(newListener)});
    }
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({behavior:'smooth'});
  }

  addListeners = channelId => {
    this.addMessageListener(channelId);
    this.addTypingListener(channelId);
  }

  addTypingListener = channelId => {
    let typingUsers = [];
    this.state.typingRef
      .child(channelId)
      .on('child_added',snap => {
        if(snap.key !== this.state.user.uid){
          typingUsers = typingUsers.concat({
            id:snap.key,
            name:snap.val()
          })
          this.setState({typingUsers});
        }
      });

    this.addToListeners(channelId,this.state.typingRef,'child_added');

    this.state.typingRef.child(channelId).on('child_removed',snap => {
      const index = typingUsers.findIndex(user=>user.id === snap.key)

      if(index !== -1){
        typingUsers = typingUsers.filter(user => user.id !== snap.key)
        this.setState({typingUsers});
      }
    });

    this.addToListeners(channelId,this.state.typingRef,'child_removed');

    this.state.connectedRef.on('value',snap => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(channelId)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove(err=>{
            if(err !== null){
              console.error(err);
            }
          })
      }
    })
  }

  addMessageListener = channelId => {
    let loadedMessages = [];
    let sampleMessage = ["Hi, I'm Ryan. Welcome to Flack!"]; // seed data


    const ref = this.getMessagesRef();
    if(ref === this.state.privateMessagesRef && channelId.includes('MhfwvUPmxIemgkIJcGnWUAGknpt1')){
      ref.child(channelId).once("value",snap => {
        console.log('here');
        if(!snap.exists()){
          console.log(snap);
          snap
            .ref
            .push()
            .set(this.seedMessage())
            .catch(err=>{
              console.error(err);
              this.setState({
                loading:false,
                errors:this.state.errors.concat(err)
              })
            });

            //set messages loading false here, or do it in a then
        }
      })
    }

    ref.child(channelId).on('child_added', snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages:loadedMessages,
        messagesLoading:false
      });
      this.countUniqueUsers(loadedMessages);
      this.countUserPosts(loadedMessages);
    });
    setTimeout(()=>this.setState({messagesLoading:false}),1000);
    this.addToListeners(channelId,ref,'child_added');
  };

  seedMessage = () => {
    const message = {
      timestamp:firebase.database.ServerValue.TIMESTAMP,
      user:{
        id:'MhfwvUPmxIemgkIJcGnWUAGknpt1',
        name:'ryan',
        avatar:'http://gravatar.com/avatar/a9cb751c819c8a341d95587f677fec3a?d=identicon'
      },
    }

    message['content'] = "Hi, I'm Ryan. welcome to Flack! :)";

    return message;
  }

  addUserStarsListener = (channelId,userId) => {
    this.state.usersRef
      .child(userId)
      .child('starred')
      .once('value')
      .then(data => {
        if(data.val() !== null){
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId)
          this.setState({isChannelStarred:prevStarred});
        }
      })
  }

  getMessagesRef = () => {
    const {messagesRef,privateMessagesRef,isPrivateChannel} = this.state;
    return isPrivateChannel ? privateMessagesRef : messagesRef;
  };

  handleStar = () => {
    this.setState(prevState=>({
      isChannelStarred:!prevState.isChannelStarred
    }),() => this.starChannel());
  };

  starChannel = () => {
    if(this.state.isChannelStarred){
      this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .update({
          [this.state.channel.id]:{
            name:this.state.channel.name,
            details:this.state.channel.details,
            createdBy:{
              name:this.state.channel.createdBy.name,
              avatar:this.state.channel.createdBy.avatar
            }
          }
        });
    } else{
      this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove(err => {
          if(err !== null){
            console.error(err);
          }
        });
    }
  };

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
  };

  countUserPosts = messages => {
    let userPosts = messages.reduce((acc,message)=>{
      if(message.user.name in acc){
        acc[message.user.name].count += 1;
      } else{
        acc[message.user.name] = {
          avatar:message.user.avatar,
          count:1
        }
      }
      return acc;
    },{});
    this.props.setUserPosts(userPosts);
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
    const result = this.state.isPrivateChannel ? '@' : '#'
    return channel
      ? `${result}${channel.name}`
      : "";
  };

  displayTypingUsers = users => (
    users.length > 0 && users.map(user => (
      <div style={{display:"flex",alignItems:"center",marginBottom:'0.2em'}} key={user.id}>
        <span className="user__typing">{user.name} is typing</span> <Typing />
      </div>
    ))
  );

  displayMessagesSkeleton = loading =>
    loading ? (
      <React.Fragment>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </React.Fragment>
    ) : null;

  displayEmpty = () => {
    return (
    <Segment inverted textAlign="center" className='empty__message'>
    Nothing here, yet. Send a message!
    </Segment>
  )}

  render(){
    const {messagesRef,channel,user,messages,numUniqueUsers,
      searchTerm,searchResults,searchLoading,isPrivateChannel,isChannelStarred,
      typingUsers,messagesLoading} = this.state;

    return (
      <React.Fragment>
        <MessagesHeader
          handleSearchChange={this.handleSearchChange}
          numUniqueUsers={numUniqueUsers}
          channelName={this.displayChannelName(channel)}
          searchLoading={searchLoading}
          isPrivateChannel={isPrivateChannel}
          isChannelStarred={isChannelStarred}
          handleStar={this.handleStar}
        />

        <Segment>
          <Comment.Group className='messages'>
            {this.displayMessagesSkeleton(messagesLoading)}
            {(!messages.length && !messagesLoading) ? this.displayEmpty() : (searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages))}
              {this.displayTypingUsers(typingUsers)}
              <div ref={node=>(this.messagesEnd = node)}></div>
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

export default connect(null,{setUserPosts})(Messages);
