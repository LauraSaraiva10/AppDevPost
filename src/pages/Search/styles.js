import styled from 'styled-components/native';

export const Container = styled.View`
    padding-top: 15px;
    flex:1;
    background-color: #353840;
`;

export const AreaInput = styled.View`
    flex-direction: row;
    margin: 10px;
    background-color: #F1F1F1;
    align-items: center;
    padding: 5px 10px;
    border-radius: 5px;
`;

export const Input = styled.TextInput`
    width: 90%;
    background-color: #F1F1F1;
    height: 40px;
    padding-left: 8px;
    font-size: 17px;
    color: #121212;
`;

export const List = styled.FlatList`
    flex:1;
`;