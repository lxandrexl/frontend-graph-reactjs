import axios from 'axios';
import { baseUrl, cognitoClientId, cognitoUserPoolId } from './constants';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';

export async function loginService(payload) {
    const { data } = await axios.post(`${baseUrl}/auth/login`, payload)

    return data.details;
}

export async function getDevices(token) {
    const header = { headers: { Authorization: `Bearer ${token}`}}
    const { data } = await axios.get(`${baseUrl}/devices`, header)

    if(data.status == 'ok') {
        console.log('DATA DEVICES')
        console.log(data.data)
        localStorage.setItem('devices', JSON.stringify(data.data))
    }
}

export function getCognitoUser (email) {
    const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
    const CognitoUser = AmazonCognitoIdentity.CognitoUser;

    const poolData = { 
      UserPoolId : cognitoUserPoolId,
      ClientId : cognitoClientId
    };

    const userPool = new CognitoUserPool(poolData);
    const userData = {
      Username : email, 
      Pool : userPool
    };
    return new CognitoUser(userData);
}

export async function refreshCognitoToken(cognitoUser, refreshToken) {
    let CognitoRefreshToken = AmazonCognitoIdentity.CognitoRefreshToken;
    let token = new CognitoRefreshToken({ RefreshToken: refreshToken })

    return new Promise(function(resolve, reject) {
        cognitoUser.refreshSession(token, (err, session) => {
            if (err)  resolve(err);

            let tokens = getTokens(session)
    
            resolve(tokens);
        });
    })
}

function getTokens (session) {
    return {
        idToken: session.getAccessToken().getJwtToken(),
        accessToken: session.getIdToken().getJwtToken(),
        refreshToken: session.getRefreshToken().getToken()
    };
}