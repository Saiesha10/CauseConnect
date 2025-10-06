import { ApolloClient,InMemoryCache,HttpLink } from "@apollo/client";
import {setContext} from '@apollo/client/link/context';
import {auth} from './firebase';
const httplink=new HttpLink({
    uri: 'https://lasting-bream-91.hasura.app/v1/graphql',
});
const authLink=setContext(async (__dirname,{headers }=>{
    const user=auth.currentUser;
    if (user){
        const token=await user.getIdToken();
        return{
            headers:{
                ...headers,
                Authorization: `Bearer ${token}`,
                'X-Hausra-Role':user.email.endsWith(@ngo)

            }
        }
    }
}));