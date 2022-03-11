import React, { Component } from 'react';
import {
  Button,
  ScrollView,
  TextInput,
  Text,
  View,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getFriendData = async (done) => {
  try {
    const jsonFriend = await AsyncStorage.getItem('@friend');
    const dataP = JSON.parse(jsonFriend);
    return done(dataP);
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

class ViewfriendScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      profileData: {},
      storePost: {},
      isLoading: true,
      photo: null,
    };
  }

  viewPost = () => {
    storePostData(this.state.storePost);
    this.props.navigation.navigate('View Post');
  };

  get_profile_image = async () => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    let id = this.state.storedFriend;
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

  getUser = async () => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    let id = this.state.storedFriend;
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

  getPosts = async () => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    let id = this.state.storedFriend;
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
          postData: responseJson,
          isLoading: false,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  likePost = async (post_id) => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    let id = this.state.storedFriend;
    return fetch(
      'http://localhost:3333/api/1.0.0/user/' +
        id +
        '/post/' +
        post_id +
        '/like',
      {
        method: 'post',
        headers: {
          'X-Authorization': tokenz,
          'content-type': 'application/json',
        },
      }
    )
      .then((response) => response.json())
      .then(this.getPosts())
      .then((responseJson) => {
        this.setState({
          isLoading: false,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  unlikePost = async (post_id) => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    let id = this.state.storedFriend;
    return fetch(
      'http://localhost:3333/api/1.0.0/user/' +
        id +
        '/post/' +
        post_id +
        '/like',
      {
        method: 'DELETE',
        headers: {
          'X-Authorization': tokenz,
          'content-type': 'application/json',
        },
      }
    )
      .then((response) => response.json())
      .then(this.getPosts())
      .then((responseJson) => {
        this.setState({
          isLoading: false,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      getFriendData((dataP) => {
        this.setState({
          storedFriend: dataP,
          isLoading: false,
        });
      });
      this.getUser();
      this.get_profile_image();
      this.getPosts();
    });
  }

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
            <Text style={styles.title}>
              {this.state.profileData.first_name}{' '}
              {this.state.profileData.last_name}
            </Text>
            <Text style={styles.title}> My Posts: </Text>
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
                        title="Like"
                        onPress={() => {
                          this.likePost(item.post_id);
                          this.setState({ isLoading: true }, () => {
                            this.getPosts();
                          });
                        }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        color="#ff5c5c"
                        title="Unlike"
                        onPress={() => {
                          this.unlikePost(item.post_id);
                          this.setState({ isLoading: true }, () => {
                            this.getPosts();
                          });
                        }}
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

export default ViewfriendScreen;
