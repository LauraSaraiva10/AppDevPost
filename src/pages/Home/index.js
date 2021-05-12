import React, { useState, useContext, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Container, ButtonPost, ListPosts } from './styles';
import { View, Text, ActivityIndicator } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';
import PostsList from '../../components/PostsList';
import { AuthContext } from '../../contexts/auth';
import firestore from '@react-native-firebase/firestore';

export default function Home() {
const navigation = useNavigation();
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(true);
const { user } = useContext(AuthContext);

useEffect(() => {
  
    const subscriber = firestore().
    collection('posts')
    .orderBy('created', 'desc')
    .onSnapshot( snapshot => {
      const postList = [];

      snapshot.forEach(doc => {
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
    
      <Header/>

      { loading ? 
        (
          <View style={{ flex:1, justifyContent: 'center', alignItems:'center' }} >
            <ActivityIndicator  size={50} color={'#e52246'} />
          </View>
        ):
        (
          <ListPosts
          showVerticalScrollIndicator={false}
          data={posts}
          renderItem={ ({item}) => <PostsList data={item} userId={user.uid} /> }
          />
        )
      }

      <ButtonPost onPress={ () => navigation.navigate('NewPost') }>
        <Feather
          name="edit-2"
          size={25}
          color="#FFF"
        />
      </ButtonPost>

   </Container>
  );
}