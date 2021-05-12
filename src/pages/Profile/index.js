import React, { useContext, useState, useEffect } from 'react';
import { Modal, Platform } from 'react-native';
import { AuthContext } from '../../contexts/auth';
import { Container, UploadButton, UploadText, Avatar, Name, Email, Button, ButtonText, ModalContainer, ButtonBack, Input } from './styles';
import Feather from 'react-native-vector-icons/Feather';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Header from '../../components/Header';
import ImagePicker from 'react-native-image-picker';

export default function Profile() {
  const { signOut, storageUser, user, setUser} = useContext(AuthContext);
  const [nome, setNome] = useState(user?.nome);
  const [url, setUrl] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {

    async function load(){

      try{
        let response = await storage().ref('users').child(user?.uid).getDownloadURL();
        setUrl(response);
      }catch(err){
        console.log('Error. Nenhuma foto foi encontrada.');
      }
    }
    
    load();

  });

  //atualizar perfil
  async function uploadProfile(){
    if(nome === ''){
      return;
    }

    await firestore().collection('users')
    .doc(user.uid).update({
      nome: nome
    });

    //Buscar todos os posts do user para atualizar o nome
    const postDocs = await firestore().collection('posts')
    .where('userId','==',user.uid).get();

    //Percorrer e atualizar os nomes do autor desse post
    postDocs.forEach( async doc => {
      await firestore().collection('posts').doc(doc.id).update({
        autor:nome
      });
    });

    let data={
      uid: user.uid,
      nome: nome,
      email: user.email
    };

    storageUser(data);
    setUser(data);
    setOpen(false);

  }

  const uploadFile = () => {
    const options = {
      noData: true,
      mediaType: 'photo'
    };

    ImagePicker.launchImageLibrary(options, response => {

      if(response.didCancel){
        console.log('CANCELOU O MODAL');
      }else if(response.error){
        console.log('Erro: ' + response.error);
      }else{
        uploadFileFirebase(response)
        .then( () => {
          uploadAvatarPosts();
        });

        setUrl(response.uri);
      }

    });

  }

  const getFileLocalPath = response => {
    const { path, uri } = response;
    return Platform.OS === 'android' ? path : uri;
  }

  const uploadFileFirebase = async response => {
    const fileSource =  getFileLocalPath(response);
    const storageRef = storage().ref('users').child(user?.uid);
    return await storageRef.putFile(fileSource);
  };

  async function uploadAvatarPosts(){
      const storageRef = storage().ref('users').child(user?.uid);
      const url = await storageRef.getDownloadURL()
      .then( async image => {
        //Atuualizar todos avatarUrl dos posts do user
        const postDocs = await firestore().collection('posts')
        .where('userId', '==', user.uid).get();

        postDocs.forEach( async doc => {
          await firestore().collection('posts').doc(doc.id).update({
            avatarUrl: image
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

 return (
   <Container>
      <Header/>

    {
      url ?
      (
        <UploadButton onPress={ uploadFile }>
          <UploadText>+</UploadText>
          <Avatar 
            source={{uri: url}}
          />
        </UploadButton>
      ):
      (
        <UploadButton onPress={ uploadFile }>
          <UploadText>+</UploadText>
        </UploadButton>
      )
    }

    <Name numberOfLines={1}>{user.nome}</Name>
    <Email numberOfLines={1}>{user.email}</Email>

    <Button bg='#428cfd' onPress={() => setOpen(true)}>
      <ButtonText color='#FFF'>Atualizar Perfil</ButtonText>
    </Button>

    <Button bg='#f1f1f1' onPress={() => signOut() }>
      <ButtonText color='#3b3b3b'>Sair</ButtonText>
    </Button>

    <Modal visible={open} animationType="slide" transparent={true}>
      <ModalContainer behavior={ Platform.OS === 'android' ? '' : 'padding'} >
        <ButtonBack onPress={() => setOpen(false) }>
          <Feather
            name="arrow-left"
            size={12}
            color="#121212"
          />
          <ButtonText color="#121212">Voltar</ButtonText>
        </ButtonBack>

        <Input
          placeholder={user?.nome}
          value={nome}
          onChangeText={ (text) => setNome(text) }
        />

        <Button bg='#428cfd' onPress={uploadProfile}>
          <ButtonText color='#f1f1f1'>Atualizar</ButtonText>
        </Button>

      </ModalContainer>
    </Modal>

   </Container>
  );
}