import React from 'react';
import axios from 'axios';
import Title from './Title.jsx';
const io = require('socket.io-client');
const socket = io();
import Autocomplete from 'react-google-autocomplete';
import Autosuggest from 'react-autosuggest';

class MeetUpForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      friendId: "",
      userLocationAddress: '',
      status: '',
      mode: 'walking',
      query: 'food',
      autoCompleteArray: ['ball','bag'],
    };

    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleFriendChange = this.handleFriendChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitFriendOrAddress = this.handleSubmitFriendOrAddress.bind(this);
    this.handleMode = this.handleMode.bind(this);
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.recalculateSuggestions = this.recalculateSuggestions.bind(this);
    this.clearSuggestions = this.clearSuggestions.bind(this);
    this.getSuggestionValue = this.getSuggestionValue.bind(this);
    this.renderSuggestion = this.renderSuggestion.bind(this);
    this.getSuggestions =this.getSuggestions.bind(this);
  }

  componentDidMount() {
    socket.on('match status', (data) => {
      this.setState({ status : data });
    });

    socket.on('mode', (mode) => {
      const modes = {
        walking: 'Walk',
        'driving&avoid=highways': 'Drive',
        transit: 'take Public Transit',
        bicycling: 'Bike',
      };
      if (mode !== this.state.mode) {
        const goodMode = confirm(`Your friend wants to ${modes[mode]}, is that ok?`);
        if (goodMode) this.setState({ mode });
        else this.handleSubmitFriendOrAddress();
      }
    });
  }

  handleUserChange(event) {
    this.setState({ userId: event.target.value });
  }

  handleFriendChange(event) {
    this.setState({ friendId: event.target.value });
  }

  handleAddressChange(event) {
    this.setState({ userLocationAddress: event.target.value });
  }

  handleQueryChange(event) {
    this.setState({query: event.target.value});
  }

  getSuggestions(value){
    return axios.post('autoComplete',{ text: this.state.query })
     .then((res) => {
       console.log('data!!!!!!!',res.data);
       return res.data;
     })
     .catch((err) => console.error('error fetching suggestions: ', err));
  }
  recalculateSuggestions({value}){
    console.log('value is', value);
    // axios.post('autoComplete',{ text: this.state.query })
    //  .then((res) => {
    //    console.log('data!!!!!!!',res.data);
    //    this.setState({autoCompleteArray: res.data});
    //  })
    //  .catch((err) => console.error('error fetching suggestions: ', err));
      this.getSuggestions(value)
      .then(suggestions =>{
        console.log("sugest", suggestions);
        this.setState({autoCompleteArray: suggestions} ,()=>{
          console.log("dam");
          console.log("autoComplete" ,this.state.autoCompleteArray);
        });
      });

  }

  clearSuggestions(){
    if (this.state.query === ''){
      this.setState({autoCompleteArray : []});
    }
  }

  getSuggestionValue(suggestion){
    console.log('SUGEST', suggestion);
    return suggestion;
  }

  renderSuggestion(suggestion){
  return(
    <span>
      {suggestion}
    </span>);
  }

  handleSubmitFriendOrAddress(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // If the user entered an address (identified by a space)
    if (this.state.friendId.includes(' ')) {
      console.log(1);
      // socket.emit('match status', 'Searching...');
      this.setState({ status : 'Searching...' });
      socket.emit('match status', 'Searching...');
      var userId = this.props.userId;
      var location1 = { "address" : this.state.userLocationAddress, "coordinates": [0,0] };
      var location2 = { "address": this.state.friendId, "coordinates": [0,0] };
      const mode = this.state.mode;
      const query = this.state.query;
      axios.post('/two-locations', {
        userId,
        location1,
        location2,
        mode,
        query,
      }).then((res) => {
        // do something with the res
        this.setState({ status : 'Results found.' });
        // console.log('res', res)
      });
    }

    // Else the user entered a friend
    else {
      console.log(2);
      this.handleSubmit(e);
    }
  }

  handleMode({ target }) {
    this.setState({mode: target.value});
  }

  handleSubmit(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    var userId = this.props.userId;
    var friendId = this.state.friendId;
    var userLocation = {
      "address" : this.state.userLocationAddress,
      "coordinates": [0,0]
    };
    const query = this.state.query;
    const mode = this.state.mode;
    // this.setState({ status: 'Looking for your friend...'});

    axios.post('/meetings', {
      userId,
      friendId,
      userLocation,
      query,
    })
      .then(function (response) {
        socket.emit('user looking for friend',
          {
            userId,
            friendId,
            userLocation,
            mode,
          });
      })
      .catch(function (error) {
        alert('error ' + error);
      });
  }

  render(){
    return (
      <div className="meetCard">
        <div className="flex-row-center">
          <p className="meet-card-header">Logged in as:
            <span className="bold">{` ${this.props.userId}`}</span>
          </p>
        </div>
        <form
          className="loginForm"
          onSubmit={this.handleSubmitFriendOrAddress}
        >

            <p className="inputLable">Enter your location</p>
            <select
              className="mode"
              name="mode"
              onChange={this.handleMode}
              value={this.state.mode}
            >
              <option value="walking">Walk</option>
              <option value="driving&avoid=highways">Drive</option>
              <option value="transit">Public Transit</option>
              <option value="bicycling">Bike</option>
            </select>
            <Autocomplete
              autoFocus
              onPlaceSelected={ (place) => {
                this.setState({ userLocationAddress: place.formatted_address });
              } }
              types={['address']}
              onChange={ this.handleAddressChange }
            />


            <p className="inputLable2">Your friend's name or address</p>
            <input type="text" value={ this.state.friendId } onChange={ this.handleFriendChange } />
<<<<<<< HEAD


            <p className="inputLable2">What would you like to do </p>
            <input type="text" options ={this.state.autoCompleteArray} value={ this.state.query }  onChange={ this.handleQueryChange }/>

=======
          </div>
          <div className="search">
            <p>What would you like to do </p>
            <Autosuggest
              suggestions={ this.state.autoCompleteArray }
              onSuggestionsFetchRequested={ this.recalculateSuggestions }
              onSuggestionsClearRequested = { this.clearSuggestions }
              getSuggestionValue = { this.getSuggestionValue}
              renderSuggestion={this.renderSuggestion}
              inputProps = {{
                value: this.state.query,
                onChange: this.handleQueryChange
              }}

              />
          </div>
>>>>>>> autoC
          <button className="submit" type="submit">Join</button>
        </form>
        <p className="messageText">{ this.state.status }</p>
      </div>
    );
  }
}

export default MeetUpForm;
