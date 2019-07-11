import React from 'react';
import Register from './Register';
import NavMenu from './NavMenu';
class RegisterContainer extends React.Component {

  render () {
  return (
    <div>
      <NavMenu color={'#f2711c'}/>
      <Register />
      <video id="background-video" loop autoPlay muted>
        <source src={'https://res.cloudinary.com/dbnklrpzq/video/upload/v1562805634/Pexels_Videos_2625_ggndz9.mp4'} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )}
}

export default RegisterContainer;
