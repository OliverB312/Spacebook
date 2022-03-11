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

const getPostData = async (done) => {
  try {
    const jsonPost = await AsyncStorage.getItem('@post');
    const dataP = JSON.parse(jsonPost);
    return done(dataP);
  } catch (e) {
    console.error(e);
  }
};

class ViewpostScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      storedPost: {},
      isLoading: true,
    };
  }

  componentDidMount() {
    getPostData((dataP) => {
      this.setState({
        storedPost: dataP,
        isLoading: false,
      });
    });
  }


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
        <Text style={ {fontSize: 20} }>{this.state.storedPost.text} </Text>
      </ScrollView>
    );
  }
}

export default ViewpostScreen;
