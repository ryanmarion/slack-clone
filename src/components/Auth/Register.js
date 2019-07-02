import React from 'react';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';

class Register extends React.Component {
  state = {
    username:"",
    email:"",
    password:"",
    passwordConfirmation:"",
    errors:[],
    loading:false
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
          this.setState({loading:false})
          console.log(createdUser);
        })
        .catch(err=>{
          console.log(err);
          this.setState({errors:this.state.errors.concat(err),loading:false});
        });
    }
  };

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

  render(){
    const {username,
           email,
           password,
           passwordConfirmation,
           errors,
           loading} = this.state;

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
                                className={errors.some(error=>error.message.toLowerCase().includes('email')) ? 'error' :  ''}
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
