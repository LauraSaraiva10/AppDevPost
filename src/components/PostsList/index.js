import React, { useRef } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useNavigation} from '@react-navigation/native';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Container, Header, Avatar, Name, ContentView, Content, Actions, 
LikeButton, Like, TimePost} from './styles';
import * as Animatable from 'react-native-animatable';

const HeartAnimated = Animatable.createAnimatableComponent(MaterialCommunityIcons);

export default function PostsList({ data, userId }) {

    const navigation = useNavigation();
    const likeRef = useRef(null);

    function formatTimePost(){
        // Converter timestamp para Data
        const datePost = new Date(data.created.seconds * 1000);

        return formatDistance(
            new Date(),
            datePost,
            {
                locale: ptBR
            }
        )
        
    }

    async function likePost(id, likes){
        const docId = `${userId}_${id}`;

        likeRef.current.rubberBand();

        //Verificar se o post já foi curtido
        const doc = await firestore().collection('likes')
        .doc(docId).get();

        if(doc.exists){
            //o utilizador já curtiu esse post
                await firestore().collection('posts')
            .doc(id).update({
                likes: likes - 1
            })

            await firestore().collection('likes')
            .doc(docId).delete();
            return;
        }

        //Criar o like do utilizador no post
        await firestore().collection('likes')
        .doc(docId).set({
            postId: id,
            userId: userId, 
        })

        //Somar + 1 like no post
        await firestore().collection('posts')
        .doc(id).update({
            likes: likes + 1
        });
    }

 return (
   <Container>
       <Header onPress={ () => navigation.navigate('PostsUser', {title: data?.autor, userId: data?.userId }) }>
           {
               data.avatarUrl ?
               (
                <Avatar
                source={{uri: data.avatarUrl}}
                />
               ) :
               (
                <Avatar
                source={require('../../assets/avatar.png')}
                /> 
               )
           }
            <Name>{data?.autor}</Name>
       </Header>

       <ContentView>
            <Content>{data?.content}</Content>
       </ContentView>

       <Actions>
           <LikeButton onPress={ () => likePost(data.id, data.likes) } >
               <Like>
                   {data?.likes === 0 ? '' : data?.likes}
                </Like>
               <HeartAnimated
               ref={likeRef}
               name={data?.likes === 0 ? 'heart-plus-outline' : 'cards-heart'}
               size={20}
               color="#e52246"
               />
           </LikeButton>

           <TimePost>
            {formatTimePost()}
           </TimePost>
       </Actions>

   </Container>
  );
}