import React, { Component } from 'react';
import {
  Text,
  ScrollView,
  View,
  Button,
  FlatList,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

class RequestScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listData: [],
      isLoading: true,
    };
  }
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
    });
  }

  getRequests = async () => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    return fetch('http://localhost:3333/api/1.0.0/friendrequests', {
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

  addFriend = async (id) => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    return fetch('http://localhost:3333/api/1.0.0/friendrequests/' + id, {
      method: 'post',
      headers: {
        'X-Authorization': tokenz,
        'content-type': 'application/json',
      },
    })
      .then((response) => {
        this.getRequests();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  deleteFriend = async (id) => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    return fetch('http://localhost:3333/api/1.0.0/friendrequests/' + id, {
      method: 'DELETE',
      headers: {
        'X-Authorization': tokenz,
        'content-type': 'application/json',
      },
    })
      .then((response) => {
        this.getRequests();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('@session_token');
    if (value !== null) {
      this.setState({ token: value });
    } else {
      this.props.navigation.navigate('Login');
    }
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
                  {item.first_name} {item.last_name}
                </Text>
                <Button
                  title="Add Friend"
                  onPress={() => this.addFriend(item.user_id)}
                />
                <Button
                  title="Delete Request"
                  onPress={() => this.deleteFriend(item.user_id)}
                />
              </View>
            )}
            keyExtractor={(item, index) => item.id}
          />
		  <Text>   </Text>
          <Button title="Get Requests" onPress={() => this.getRequests()} />
        </View>
      </View>
    );
  }
}

export default RequestScreen;
