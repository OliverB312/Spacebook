import React, { Component } from 'react';
import { Button, ScrollView, TextInput, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getLoginData = async (done) => {
  try {
    const jsonValue = await AsyncStorage.getItem('@spacebook_details');
    const data = JSON.parse(jsonValue);
    return done(data);
  } catch (e) {
    console.error(e);
  }
};

class EditScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      login_info: [],
      profileData: {},
      isLoading: true,
    };
  }

  componentDidMount() {
    getLoginData((data) => {
      this.setState({
        login_info: data,
        isLoading: false,
      });
    });
    this.getUser();
  }

  camera = () => {
    this.props.navigation.navigate('Camera');
  };

  getUser = async () => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    let id = this.state.login_info.id;
    return fetch('http://localhost:3333/api/1.0.0/user/' + id, {
      method: 'GET',
      headers: {
        'X-Authorization': tokenz,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 401) {
          this.props.navigation.navigate('Login');
        } else if (response.status === 500) {
          throw 'Server Error';
        } else if (response.status === 404) {
          throw 'Not Found';
        } else {
          throw 'Something went wrong';
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          profileData: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  editDetails = async () => {
    let to_send = {};

    if (this.state.first_name != this.state.profileData.first_name) {
      to_send['first_name'] = this.state.first_name;
    }

    if (this.state.last_name != this.state.profileData.last_name) {
      to_send['last_name'] = this.state.last_name;
    }

    if (this.state.email != this.state.profileData.email) {
      to_send['email'] = this.state.email;
    }

    if (this.state.password != this.state.profileData.password) {
      to_send['password'] = this.state.password;
    }

    console.log(JSON.stringify(to_send));

    const tokenz = await AsyncStorage.getItem('@session_token');
    let id = this.state.login_info.id;
    return fetch('http://localhost:3333/api/1.0.0/user/' + id, {
      method: 'PATCH',
      headers: {
        'X-Authorization': tokenz,
        'content-type': 'application/json',
      },
      body: JSON.stringify(to_send),
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('Details updated');
        } else if (response.status === 401) {
          this.props.navigation.navigate('Login');
        } else if (response.status === 400) {
          throw 'Bad Request';
        } else if (response.status === 403) {
          throw 'Forbidden';
        } else if (response.status === 500) {
          throw 'Server Error';
        } else if (response.status === 404) {
          throw 'Not Found';
        } else {
          throw 'Something went wrong';
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    return (
      <ScrollView>
        <Button title="Take new photo" onPress={() => this.camera()} />
        <TextInput
          placeholder="Enter your first name..."
          onChangeText={(first_name) => this.setState({ first_name })}
          value={this.state.first_name}
          style={{ padding: 5, borderWidth: 1, margin: 5 }}
        />
        <TextInput
          placeholder="Enter your last name..."
          onChangeText={(last_name) => this.setState({ last_name })}
          value={this.state.last_name}
          style={{ padding: 5, borderWidth: 1, margin: 5 }}
        />
        <TextInput
          placeholder="Enter your email..."
          onChangeText={(email) => this.setState({ email })}
          value={this.state.email}
          style={{ padding: 5, borderWidth: 1, margin: 5 }}
        />
        <TextInput
          placeholder="Enter your password..."
          onChangeText={(password) => this.setState({ password })}
          value={this.state.password}
          secureTextEntry
          style={{ padding: 5, borderWidth: 1, margin: 5 }}
        />
        <Button title="Update Profile" onPress={() => this.editDetails()} />
      </ScrollView>
    );
  }
}

export default EditScreen;
