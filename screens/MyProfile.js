import React, { Component } from 'react';
import {
  Text,
  ScrollView,
  View,
  Button,
  FlatList,
  StyleSheet,
  ToastAndroid,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const getLoginData = async (done) => {
  try {
    const jsonValue = await AsyncStorage.getItem('@spacebook_details');
    const data = JSON.parse(jsonValue);
    return done(data);
  } catch (e) {
    console.error(e);
  }
};

const storePostData = async (value) => {
  try {
    const jsonPost = JSON.stringify(value);
    await AsyncStorage.setItem('@post', jsonPost);
  } catch (e) {
    console.error(e);
  }
};

const styles = StyleSheet.create({
  title: {
    marginTop: 16,
    paddingVertical: 4,
    borderWidth: 4,
    borderColor: '#20232a',
    borderRadius: 3,
    backgroundColor: '#61dafb',
    color: '#20232a',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

class ProfileScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      login_info: [],
      postData: [],
      storePost: {},
      profileData: {},
      isLoading: true,
      photo: null,
    };
  }
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      getLoginData((data) => {
        this.setState({
          login_info: data,
          isLoading: false,
        });
      });
    });
  }

  edit = () => {
    this.props.navigation.navigate('Edit');
  };

  friends = () => {
    this.props.navigation.navigate('Friends');
  };

  post = () => {
    this.props.navigation.navigate('Make Post');
  };

  editPost = () => {
    storePostData(this.state.storePost);
    this.props.navigation.navigate('Edit Post');
  };

  viewPost = () => {
    storePostData(this.state.storePost);
    this.props.navigation.navigate('View Post');
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

  get_profile_image = async () => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    let id = this.state.login_info.id;
    fetch('http://localhost:3333/api/1.0.0/user/' + id + '/photo', {
      method: 'GET',
      headers: {
        'X-Authorization': tokenz,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.blob();
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
      .then((responseBlob) => {
		let data = URL.createObjectURL(responseBlob);
        this.setState({
          isLoading: false,
          photo: data,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getPosts = async () => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    let id = this.state.login_info.id;
    return fetch('http://localhost:3333/api/1.0.0/user/' + id + '/post', {
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
          throw 'Can only view posts of you and your friends';
        } else if (response.status === 404) {
          throw 'Not Found';
        } else {
          throw 'Something went wrong';
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          postData: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  deletePost = async (post_id) => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    let id = this.state.login_info.id;
    return fetch(
      'http://localhost:3333/api/1.0.0/user/' + id + '/post/' + post_id,
      {
        method: 'DELETE',
        headers: {
          'X-Authorization': tokenz,
          'content-type': 'application/json',
        },
      }
    )
      .then((response) => {
        if (response.status === 200) {
          this.getPosts();
          return response.json()
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
      .catch((error) => {
        console.log(error);
      });
  };

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('@session_token');
    if (value !== null) {
      this.setState({ token: value });
      this.getUser();
      this.get_profile_image();
      this.getPosts();
    } else {
      this.props.navigation.navigate('Login');
    }
  };

  logout = async () => {
    let token = await AsyncStorage.getItem('@session_token');
    await AsyncStorage.removeItem('@session_token');
    return fetch('http://localhost:3333/api/1.0.0/logout', {
      method: 'post',
      headers: {
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          this.props.navigation.navigate('Login');
        } else if (response.status === 401) {
          this.props.navigation.navigate('Login');
        } else if (response.status === 500) {
          throw 'Server Error';
        } else {
          throw 'Something went wrong';
        }
      })
      .catch((error) => {
        console.log(error);
        ToastAndroid.show(error, ToastAndroid.SHORT);
      });
  };

  render() {
    if (!this.state.isLoading) {
      return (
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}>
            <Image
              source={{
                uri: this.state.photo,
              }}
              style={{
                width: 335,
                height: 300,
                borderWidth: 5,
                alignSelf: 'center',
              }}
            />
            <Button title="Edit Details" onPress={() => this.edit()} />
            <Button title="Logout" onPress={() => this.logout()} />
            <Text style={styles.title}>
              {this.state.profileData.first_name}{' '}
              {this.state.profileData.last_name}
            </Text>
            <Button title="Friends list" onPress={() => this.friends()} />
            <Text style={styles.title}> My Posts: </Text>
            <Button title="Make new post" onPress={() => this.post()} />
            <FlatList
	          style={{alignSelf: 'center'}}
              data={this.state.postData}
              renderItem={({ item }) => (
                <View>
                  <Text>
                    {item.author.first_name} {item.author.last_name}
                  </Text>
                  <Text> {item.text} </Text>
                  <Text> Likes: {item.numLikes} </Text>
                  <View style={{ flexDirection: 'row', width: 250 }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        color="#b8860b"
                        title="View"
                        onPress={() => {
                          this.setState(
                            { storePost: item, isLoading: true },
                            () => {
                              this.viewPost();
                            }
                          );
                        }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Edit"
                        onPress={() => {
                          this.setState(
                            { storePost: item, isLoading: true },
                            () => {
                              this.editPost();
                            }
                          );
                        }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        color="#ff5c5c"
                        title="Delete"
                        onPress={() => this.deletePost(item.post_id)}
                      />
                    </View>
                  </View>
                </View>
              )}
              keyExtractor={(item, index) => item.post_id}
            />
          </ScrollView>
        </View>
      );
    } else {
      return (
        <View>
          <Text>Loading...</Text>
        </View>
      );
    }
  }
}

export default ProfileScreen;
