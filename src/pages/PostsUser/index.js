import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { Container, ListPosts } from './styles';
import PostList from '../../components/PostsList';

export default function PostsUser({ route }) {

  const navigation = useNavigation();
  const [title,setTitle] = useState(route.params?.title);
  const [posts,setPosts] = useState([]);
  const [loading,setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title === '' ? '' : title 
    });

  },[navigation,title]);

  useEffect(() => {

    const subscriber = firestore().collection('posts')
    .where('userId','==', route.params.userId)
    .orderBy('created','desc').onSnapshot( snapshot => {

      const postList = [];

      snapshot.forEach( doc => {
        postList.push({
          ...doc.data(),
          id: doc.id
        });
      });

      setPosts(postList);
      setLoading(false);

    });


    return () => subscriber();

  },[]);

 return (
    <Container>
      {
        loading ? 
        (
          <View style={{ flex:1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size={50} color='#E52246' />
          </View>
        ):
        (
          <ListPosts
            showVerticalScrollIndicator={false}
            data={posts}
            renderItem={ ({ item }) => <PostList data={item} userId={route.params.userId } /> }
          />
        )
      }
    </Container>
  );
}