import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="AppDark fill" id="AppContainer">
        <header className="App-headerDark" id="AppHeader">
            <h1 className="App-title">YouTube Audio Player</h1>
            <button className="btn btn-outline-light" id="changeSkinButton">Day mode</button>
        </header>
          <div className="container-fluid">
              <h5 id="title">Enter Youtube video Link</h5>
              <p id="greyText">Use intro to get the audio from the link</p>
              <div className="d-flex row justify-content-center align-items-center" id="audioQuery">
                  <div className="col-md-6 col-sm-12">
                      <div className="input-group" id="input">
                          <div className="input-group-prepend">
                              <input type="button" className="input-group-text btn btn-outline-dark" id="test" name="test" value="TEST"/>
                          </div>
                          <input type="text" className="form-control" id="videoURL" name="videoURL"/>
                      </div>
                      <div className="alert alert-danger" id="alert" role="alert">
                          
                      </div>
                      <div className="title" id="NP">
                          Now Playing:
                          <div id="title" className="text-center"/>
                      </div>
                      <audio id="player" className="player" controls/>
                  </div>
              </div>
          </div>
      </div>
    );
  }
}
export default App;
