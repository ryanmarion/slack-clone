import React from 'react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';
import {Menu,Icon,Modal,Form,Button,Input,List,Image} from 'semantic-ui-react';

class DirectMessages extends React.Component{
  state = {
    activeChannel:'',
    user:this.props.currentUser,
    users:[],
    usersDirect:[],
    userSearch:'',
    userSearchLoading:false,
    usersRef:firebase.database().ref('users'),
    connectedRef:firebase.database().ref('.info/connected'),
    presenceRef:firebase.database().ref('presence'),
    privateMessagesRef:firebase.database().ref('privateMessages'),
    modal:false,
    searchResults:'',
    userToLoad:''
  }

  componentDidMount(){
    if(this.state.user){
      this.addListeners(this.state.user.uid);
    }
  }

  componentWillUnmount(){
    this.removeListeners();
  };

  removeListeners = () => {
    this.state.usersRef.off();
    this.state.presenceRef.off();
    this.state.connectedRef.off();
  }

  addListeners = currentUserId => {
    let loadedUsers = [];
    this.state.usersRef.on('child_added', snap => {
      if(currentUserId !== snap.key){
        let user = snap.val();
        user['uid'] = snap.key;
        user['status'] = 'offline';
        loadedUsers.push(user);
        this.setState({ users: loadedUsers});
      }
    });

    let usersDirect = [];
    this.state.privateMessagesRef.on('child_added', snap => {
      let uid2 = Object.keys(snap.val());
      if(currentUserId !== snap.key && uid2.includes(currentUserId) && !this.state.usersDirect.includes(snap.key)){
        usersDirect.push(snap.key);
      } else if (currentUserId === snap.key){
        uid2.forEach(user =>{
          if(!this.state.usersDirect.includes(user)){
            usersDirect.push(user);
          }
        });
      }

      this.setState({usersDirect})
    });

    this.state.connectedRef.on('value',snap => {
      if(snap.val()===true){
        const ref = this.state.presenceRef.child(currentUserId)
        ref.set(true);
        ref.onDisconnect().remove(err =>{
          if(err !== null){
            console.error(err);
          }
        })
      }
    });

    this.state.presenceRef.on('child_added',snap => {
      if(currentUserId !== snap.key){
          this.addStatusToUser(snap.key);
      }
    });

    this.state.presenceRef.on('child_removed',snap => {
      if(currentUserId !== snap.key){
          this.addStatusToUser(snap.key,false);
      }
    });

  }

  addStatusToUser = (userId,connected=true) => {
    const updatedUsers = this.state.users.reduce((acc,user)=> {
      if(user.uid === userId) {
        user['status'] = `${connected ? 'online' : 'offline'}`
      }
      return acc.concat(user);
    },[]);
    this.setState({users:updatedUsers});
  }

  isUserOnline = user => user.status === 'online';

  getChannelId = userId => {
    const currentUserId = this.state.user.uid;
    return userId < currentUserId ?
      `${userId}/${currentUserId}` : `${currentUserId}/${userId}`;
  }

  changeChannel = user => {
    const channelId = this.getChannelId(user.uid);
    const channelData = {
      id:channelId,
      name:user.name
    };
    this.props.setCurrentChannel(channelData);
    this.props.setPrivateChannel(true);
    this.setActiveChannel(user.uid);
  };

  setActiveChannel = userId => {
    this.setState({activeChannel:userId});
  }

  closeModal = () => this.setState({modal:false});

  openModal = () => this.setState({modal:true});

  handleSearcChange = e => {
    this.setState({
      [e.target.name]:e.target.value,
      userSearchLoading:true
    },()=> this.handleSearchUsers());
  };

  handleSearchUsers = () => {
    const {users,userSearch} = this.state;
    const regex = new RegExp(userSearch,'gi');
    const searchResults = users.reduce((acc,user) => {
      if (user.name && user.name.match(regex)){
        acc.push(user);
      }
      return acc;
    },[]);
    this.setState({ searchResults });
    setTimeout(()=> this.setState({ userSearchLoading:false}),1000);
  };

  displaySearchResults = results => (
    results.map(result=>(
      <List.Item className="user__search__result" key={result.uid} onClick={()=>this.updateSearch(result)}>
        <Image avatar src={result.avatar} />
        <List.Content>
          <List.Header>{result.name}</List.Header>
        </List.Content>
    </List.Item>
  )).slice(0,5)
  )

  updateSearch = user => {
    this.setState({
        userSearch:user.name,
        userToLoad:user
    });
  };

  handleSubmit = e => {
    if (this.isFormValid(this.state)){
      this.addChannel();
    };
    this.closeModal();
  };

  addChannel = () => {
    const {userToLoad,usersDirect} = this.state;

    if (!usersDirect.includes(userToLoad.uid)) usersDirect.push(userToLoad.uid);

    this.setState({usersDirect});

    const channelId = this.getChannelId(userToLoad.uid);
    const channelData = {
      id:channelId,
      name:userToLoad.name
    };
    this.props.setPrivateChannel(true);
    this.props.setCurrentChannel(channelData);
    this.setActiveChannel(userToLoad.uid);

    this.setState({
      userSearch:'',
      searchResults:'',
    })
  }

  isFormValid = ({userToLoad}) => userToLoad;

  displayUsers = (usersDirect,activeChannel,users) => {

    return users.filter(user => usersDirect.includes(user.uid)).map(user=>(
      <Menu.Item
        key={user.uid}
        active={user.uid === activeChannel}
        onClick={() => this.changeChannel(user)}
        style={{opacity:0.7,fontStyle:'italic'}}
      >
        <Icon
          name="circle"
          color={this.isUserOnline(user) ? 'green' : 'red'}
        />
        @ {user.name}
      </Menu.Item>
    ))
  }

  render(){
    const {users,activeChannel,modal,userSearch,userSearchLoading,searchResults,usersDirect} = this.state;

    return (
      <React.Fragment>
      <Menu.Menu className='menu'>
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MAIL
          </span>{' '}
          ({usersDirect.length})<Icon name="add" onClick={this.openModal}/>
        </Menu.Item>
        {usersDirect ? this.displayUsers(usersDirect,activeChannel,users) : '' }
      </Menu.Menu>

      <Modal className="search__modal" open={modal} onClose={this.closeModal} >
        <Modal.Header>Select a user to chat with</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleSubmit}>
            <Form.Field>
              <Input fluid
                     loading={userSearchLoading}
                     autoFocus
                     label="Username:"
                     name="userSearch"
                     value={userSearch}
                     onChange={this.handleSearcChange}
              />
            </Form.Field>

          </Form>
        </Modal.Content>

        <List divided relaxed="very" selection>
          {(userSearch && searchResults) ? (
            this.displaySearchResults(searchResults)
          ) : ''}
        </List>

        <Modal.Actions>
          <Button color="green" inverted onClick={this.handleSubmit}>
            <Icon name="checkmark" /> Add Direct Message
          </Button>
          <Button color="red" inverted onClick={this.closeModal}>
            <Icon name="remove" /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>

      </React.Fragment>
    )
  }
}

export default connect(null,{setCurrentChannel,setPrivateChannel})(DirectMessages);
