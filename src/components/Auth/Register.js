import React from 'react';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';

class Register extends React.Component {
  state={
    username:"",
    email:"",
    password:"",
    passwordConfirmation:""
  };

  handleChange = e => {
    this.setState({[e.target.name]:e.target.value});
  };

  handleSubmit = e => {
    if(isFormValid()){
      e.preventDefault();
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email,this.state.password)
        .then(createdUser => {
          console.log(createdUser);
        })
        .catch(err=>{
          console.log(err);
        });
    }
  };

  isFormValid = () => {
    if(this.isFormEmpty(this.state)){
      //throw err
    } else if(this.isPasswordValid){
      //throw err
    } else{
      //form is valid
      return true;
    }
  };

  isFormEmpty = ({username,email,password,passwordConfirmation}) => {
    return !username.length || !email.length || !password.length || !passwordConfirmation.length;
  };

  render(){
    const {username, email, password, passwordConfirmation} = this.state;

    return(
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{maxWidth:450}}>
          <Header as="h2" icon color="orange" textAlign="center">
            <Icon name="puzzle piece" color="orange"/>
            Register for Slack-Clone
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment>
              <Form.Input fluid name="username"
                                icon="user"
                                iconPosition="left"
                                placeholder="Username"
                                type="text"
                                value={username}
                                onChange={this.handleChange} />
              <Form.Input fluid name="email"
                                icon="mail"
                                iconPosition="left"
                                placeholder="Email Address"
                                value={email}
                                type="email"
                                onChange={this.handleChange} />
              <Form.Input fluid name="password"
                                icon="lock"
                                iconPosition="left"
                                placeholder="Password"
                                value={password}
                                type="password"
                                onChange={this.handleChange} />
              <Form.Input fluid name="passwordConfirmation"
                                icon="repeat"
                                iconPosition="left"
                                placeholder="Password Confirmation"
                                value={passwordConfirmation}
                                type="password"
                                onChange={this.handleChange} />
              <Button color="orange" fluid size="large">Submit</Button>
            </Segment>
          </Form>
          <Message>Already a user? <Link to="/login">Login</Link></Message>
        </Grid.Column>
      </Grid>
    )
  }
}

export default Register;
