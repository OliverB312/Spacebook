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

const storeFriendData = async (value) => {
  try {
    const jsonFriend = JSON.stringify(value);
    await AsyncStorage.setItem('@friend', jsonFriend);
  } catch (e) {
    console.error(e);
  }
};

class FriendsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      login_info: [],
      listData: {},
      friendData: {},
      isLoading: true,
      photo: null,
    };
  }

  componentDidMount() {
    getLoginData((data) => {
      this.setState({
        login_info: data,
        isLoading: false,
      });
    });
    this.getFriends();
  }

  search = () => {
    this.props.navigation.navigate('Search');
  };

  requests = () => {
    this.props.navigation.navigate('Requests');
  };

  viewFriend = () => {
    storeFriendData(this.state.friendData);
    this.props.navigation.navigate('View Friend');
  };

  getFriends = async () => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    let id = this.state.login_info.id;
    return fetch('http://localhost:3333/api/1.0.0/user/' + id + '/friends', {
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
        } else if (response.status === 403) {
          throw 'Can only view friends of yourself or your friends';
        } else if (response.status === 404) {
          throw 'Not Found';
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

  render() {
    return (
      <View>
        <View>
          <FlatList
            data={this.state.listData}
            renderItem={({ item }) => (
              <View>
                <Text>
                  {item.user_givenname} {item.user_familyname}
                </Text>
                <Button
                  title="View Profile"
                  onPress={() => {
                    this.setState(
                      { friendData: item.user_id, isLoading: true },
                      () => {
                        this.viewFriend();
                      }
                    );
                  }}
                />
              </View>
            )}
            keyExtractor={(item, index) => item.user_id}
          />
		  <Text>  </Text>
          <Button
            title="Search and add friends"
            onPress={() => this.search()}
          />
          <Button title="View Requests" onPress={() => this.requests()} />
        </View>
      </View>
    );
  }
}

export default FriendsScreen;
