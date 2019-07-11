import React from 'react';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';
import md5 from 'md5';

class Register extends React.Component {
  state = {
    username:"",
    email:"",
    password:"",
    passwordConfirmation:"",
    errors:[],
    loading:false,
    usersRef:firebase.database().ref('users')
  };

  displayErrors = (errors) => errors.map((error,i)=><p key={i}>{error.message}</p>);

  handleChange = e => {
    this.setState({[e.target.name]:e.target.value});
  };

  handleSubmit = e => {
    e.preventDefault();
    if(this.isFormValid()){
      this.setState({errors:[],loading:true})
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email,this.state.password)
        .then(createdUser => {
          // console.log(createdUser);
          createdUser.user.updateProfile({
            displayName:this.state.username,
            photoURL:`http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
          })
            .then(()=>{
              this.saveUser(createdUser).then(()=>{
                console.log('user saved');
              })
            })
            .catch(err=>{
              console.log(err);
              this.setState({errors:this.state.errors.concat(err),loading:false});
            });
        })
        .catch(err=>{
          console.log(err);
          this.setState({errors:this.state.errors.concat(err),loading:false});
        });
    }
  };

  saveUser = (createdUser) => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name:createdUser.user.displayName,
      avatar:createdUser.user.photoURL
    });
  }

  isFormValid = () => {
    let errors = [];
    let error;

    if(this.isFormEmpty(this.state)){
      error = {message:'Fill in all fields'};
      this.setState({errors:errors.concat(error)});
      return false;
    } else if(!this.isPasswordValid(this.state)){
      error = {message:'Password is invalid'};
      this.setState({errors:errors.concat(error)});
      return false;
    } else{
      //form is valid
      return true;
    }
  };

  isFormEmpty = ({username,email,password,passwordConfirmation}) => {
    return !username.length || !email.length || !password.length || !passwordConfirmation.length;
  };

  isPasswordValid = ({password,passwordConfirmation}) => {
    if(password.length < 6 || passwordConfirmation.length < 6){
      return false;
    } else if(password !== passwordConfirmation){
      return false;
    } else {
      return true;
    }
  };

  handleInputErrors(errors,inputName){
    return errors.some(error =>
      error.message.toLowerCase().includes(inputName)
    )
    ? 'error'
    : ""
  };

  render(){
    const {username,
           email,
           password,
           passwordConfirmation,
           errors,
           loading} = this.state;

    return(
      <Grid textAlign="center" verticalAlign="middle" className="login">
        <Grid.Column style={{maxWidth:450}}>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment>
              <Header as="h2" icon color="orange" textAlign="center">
              <Icon name="puzzle piece" color="orange"/>
              Register for Flack
              </Header>
              <Form.Input fluid name="username"
                                icon="user"
                                iconPosition="left"
                                placeholder="Username"
                                className={this.handleInputErrors(errors,'username')}
                                type="text"
                                value={username}
                                onChange={this.handleChange} />
              <Form.Input fluid name="email"
                                icon="mail"
                                iconPosition="left"
                                placeholder="Email Address"
                                value={email}
                                type="email"
                                className={this.handleInputErrors(errors,'email')}
                                onChange={this.handleChange} />
              <Form.Input fluid name="password"
                                icon="lock"
                                iconPosition="left"
                                placeholder="Password"
                                value={password}
                                className={this.handleInputErrors(errors,'password')}
                                type="password"
                                onChange={this.handleChange} />
              <Form.Input fluid name="passwordConfirmation"
                                icon="repeat"
                                iconPosition="left"
                                placeholder="Password Confirmation"
                                value={passwordConfirmation}
                                className={this.handleInputErrors(errors,'password')}
                                type="password"
                                onChange={this.handleChange} />
              <Button color="orange"
                      className={loading ? 'loading':''}
                      disabled={loading}
                      fluid size="large">
                      Submit
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 &&
            (<Message error>
                <h3>Error</h3>
                {this.displayErrors(errors)}
            </Message>
            )
          }
          <Message>Already a user? <Link to="/login">Login</Link></Message>
        </Grid.Column>
      </Grid>
    )
  }
}

export default Register;
