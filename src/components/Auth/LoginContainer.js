import React from 'react';
import Login from './Login';
import NavMenu from './NavMenu';

class LoginContainer extends React.Component {

  render () {
  return (
    <div>
      <NavMenu />
      <Login />
      <video id="background-video" loop autoPlay muted>
        <source src={'http://res.cloudinary.com/dwqeotsx5/video/upload/v1490374875/563400030_pgaidm.mp4'} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )}
}

export default LoginContainer;
