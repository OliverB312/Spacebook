import 'react-native-gesture-handler';
import React, { Component, View, Text } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './screens/login';
import SignupScreen from './screens/signup';
import ProfileScreen from './screens/MyProfile';
import EditScreen from './screens/Tabs/edit';
import FriendsScreen from './screens/Tabs/friends';
import SearchScreen from './screens/Tabs/search';
import RequestScreen from './screens/Tabs/requests';
import CameraScreen from './screens/Tabs/camera';
import PostScreen from './screens/Tabs/post';
import EditpostScreen from './screens/Tabs/editpost';
import ViewpostScreen from './screens/Tabs/viewpost';
import ViewfriendScreen from './screens/Tabs/viewfriend';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerMode: 'none' }}
      />
      <Stack.Screen name="Edit" component={EditScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Requests" component={RequestScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Make Post" component={PostScreen} />
      <Stack.Screen name="Edit Post" component={EditpostScreen} />
      <Stack.Screen name="View Post" component={ViewpostScreen} />
      <Stack.Screen name="View Friend" component={ViewfriendScreen} />
    </Stack.Navigator>
  );
}

class App extends Component {
  render() {
    return (
      <NavigationContainer>
        <Drawer.Navigator>
          <Drawer.Screen name="Login" component={LoginScreen} />
          <Drawer.Screen name="Signup" component={SignupScreen} />
          <Drawer.Screen name="View Profile" component={MyStack} />
        </Drawer.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
