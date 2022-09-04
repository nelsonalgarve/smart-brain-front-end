import './App.css';
import Navigation from './components/Navigation';
import Logo from './components/Logo';
import ImageLinkForm from './components/ImageLinkForm';
import Rank from './components/Rank';
import FaceRecognition from './components/FaceRecognition';
import React, { Component } from "react";
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';


const initialState = {
  
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
      id: '',
      name:'',
      email: '',
      entries: 0,
      joined: ''

  }
}

class App extends Component { 
    constructor() {
        super();
        this.state = {
            input: '',
            imageUrl: '',
            box: {},
            route: 'signin',
            isSignedIn: false,
            user: {
                id: '',
                name:'',
                email: '',
                entries: 0,
                joined: ''

            }
        }
    }

    loadUser = (data) => {
        this.setState({user: {
            id: data.id,
            name:data.name,
            email: data.email,
            entries: data.entries,
            joined: data.joined
        }})
    }

    calculateFaceLocation = (data) =>  {
        console.log(data);
        const clarifaiFace = data.outputs[0].data.clusters[0].projection;
        const image = document.getElementById('inputImage');
        const width = Number(image.width);
        const height = Number(image.height);
        console.log(width, height, clarifaiFace);
        return {
            // leftCol: 5.76,
            // topRow: 35.75,
            // rightCol: 55.28,
            // bottomRow: 12.24
            leftCol: (clarifaiFace[0] * width), 
            topRow: (clarifaiFace[1] * height),
            rightCol: (clarifaiFace[0] * width),
            bottomRow: (clarifaiFace[1] * height)
        }
    } 

    displayFaceBox = (box) => {
        console.log('box', box);
        this.setState({box: box})
    }

    onInputChange = (event) => {
        this.setState({input: event.target.value})
    }

    onButtonSubmit = () => {
        this.setState({imageUrl: this.state.input});
        fetch('https://fast-stream-11558.herokuapp.com/imageurl', {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  input: this.state.input
                })
              })
            .then(response => response.json())
          .then(response => {
            console.log('hi', response)
            if (response) {
              fetch('https://fast-stream-11558.herokuapp.com/image', {
                method: 'put',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  id: this.state.user.id
                })
              })
                .then(response => response.json())
                .then(count => {
                  this.setState(Object.assign(this.state.user, { entries: count}))
                })
                .catch(console.log)
    
            }
            this.displayFaceBox(this.calculateFaceLocation(response))
          })
          .catch(err => console.log(err));
      }

    onRouteChange = (route) => {
        if (route === 'signout') {
            this.setState(initialState)
        } else if ( route === 'home') {
            this.setState({isSignedIn: true})
        }
        this.setState({route: route});
    }
   
    

    render() {
        return (
          <div className="App">
            <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn} />
            { this.state.route === 'home' ? 
            
            <>
                <Logo />
                <Rank user={this.state.user} />
                <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
                <FaceRecognition imageUrl={this.state.imageUrl} box={this.state.box}/>
            </>
            : ( this.state.route === 'signin' ?
                    <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
                    :<Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
            )
        }
          </div>
        );
    }

}

export default App;
