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

const getPostData = async (done) => {
  try {
    const jsonPost = await AsyncStorage.getItem('@post');
    const dataP = JSON.parse(jsonPost);
    return done(dataP);
  } catch (e) {
    console.error(e);
  }
};

class EditpostScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      login_info: [],
      postInfo: [],
      storedPost: {},
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
    getPostData((dataP) => {
      this.setState({
        storedPost: dataP,
        isLoading: false,
      });
    });
  }

  editPost = async () => {
    const tokenz = await AsyncStorage.getItem('@session_token');
    let id = this.state.login_info.id;
    return fetch('http://localhost:3333/api/1.0.0/user/' + id + '/post/' + this.state.storedPost.post_id, {
      method: 'PATCH',
      headers: {
        'X-Authorization': tokenz,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        text: this.state.postInfo,
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        this.setState({
          isLoading: false,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View>
          <Text>Loading...</Text>
        </View>
      );
    }

    return (
      <ScrollView>
        <Text> Enter Text: </Text>
        <TextInput
          multiline={true}
          defaultValue={this.state.storedPost.text}
          onChangeText={(postInfo) => this.setState({ postInfo })}
          value={this.state.postInfo}
          style={{ padding: 5, borderWidth: 1, margin: 5, height: 240 }}
        />
        <Button title="Save Changes" onPress={() => this.editPost()} />
      </ScrollView>
    );
  }
}

export default EditpostScreen;
