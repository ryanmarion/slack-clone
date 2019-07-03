import React from 'react';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';

class Login extends React.Component {
  state = {
    email:"",
    password:"",
    errors:[],
    loading:false,
  };

  displayErrors = (errors) => errors.map((error,i)=><p key={i}>{error.message}</p>);

  handleChange = e => {
    this.setState({[e.target.name]:e.target.value});
  };

  handleSubmit = e => {
    e.preventDefault();
    if(this.isFormValid(this.state)){
      this.setState({errors:[],loading:true})
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email,this.state.password)
        .then(signedInUser => {
          this.setState({loading:false});
          console.log(signedInUser);
        })
        .catch(err => {
          console.error(err);
          this.setState({
            errors:this.state.errors.concat(err),
            loading:false
          });
        });

    }
  };

  isFormValid = ({email,password}) => email && password;

  handleInputErrors(errors,inputName){
    return errors.some(error =>
      error.message.toLowerCase().includes(inputName)
    )
    ? 'error'
    : ""
  };

  render(){
    const {email,
           password,
           errors,
           loading} = this.state;

    return(
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{maxWidth:450}}>
          <Header as="h2" icon color="violet" textAlign="center">
            <Icon name="code branch" color="violet"/>
            Login to Slack-Clone
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment>
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
              <Button color="violet"
                      className={loading ? 'loading':''}
                      disabled={loading}
                      fluid size="large">
                      Login
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
          <Message>Don't have an account? <Link to="/register">Register</Link></Message>
        </Grid.Column>
      </Grid>
    )
  }
}

export default Login;
