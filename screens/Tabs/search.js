import React, { Component } from 'react';
import {
  Button,
  ScrollView,
  TextInput,
  Text,
  View,
  FlatList,
} from 'react-native';
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

class SearchScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      login_info: [],
      listData: [],
      searchFriend: '',
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
  }

  searchFriends = async () => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    let id = this.state.login_info.id;
    return fetch(
      'http://localhost:3333/api/1.0.0/search?q=' + this.state.searchFriend,
      {
        method: 'GET',
        headers: {
          'X-Authorization': tokenz,
          'Content-Type': 'application/json',
        },
      }
    )
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 401) {
          this.props.navigation.navigate('Login');
        } else if (response.status === 400) {
          throw 'Bad Request';
        } else if (response.status === 500) {
          throw 'Server Error';
        } else {
          throw 'Something went wrong';
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          listData: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  addRequest = async (id) => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    let myId = this.state.login_info.id;
    return fetch('http://localhost:3333/api/1.0.0/user/' + id + '/friends', {
      method: 'post',
      headers: {
        'X-Authorization': tokenz,
        'content-type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('Request Sent');
        } else if (response.status === 401) {
          this.props.navigation.navigate('Login');
        } else if (response.status === 400) {
          throw 'Bad Request';
        } else if (response.status === 403) {
          throw 'User is already added as a friend';
        } else if (response.status === 404) {
          throw 'Not Found';
        } else if (response.status === 500) {
          throw 'Server Error';
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
        <TextInput
          placeholder="Enter a name"
          onChangeText={(searchFriend) => this.setState({ searchFriend })}
          value={this.state.searchFriend}
          style={{ padding: 5, borderWidth: 1, margin: 5 }}
        />
        <View>
          <FlatList
            data={this.state.listData}
            renderItem={({ item }) => (
              <View>
                <Text>
                  {item.user_givenname} {item.user_familyname}
                </Text>
                <Button
                  title="Add"
                  onPress={() => this.addRequest(item.user_id)}
                />
              </View>
            )}
            keyExtractor={(item, index) => item.id}
          />
          <Button
            title="Search for friends"
            onPress={() => this.searchFriends()}
          />
        </View>
      </ScrollView>
    );
  }
}

export default SearchScreen;
