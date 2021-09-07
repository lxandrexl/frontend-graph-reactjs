import { clientId } from './constants';


export function getToken() {
    const user = localStorage.getItem('CognitoIdentityServiceProvider.' + clientId + '.LastAuthUser');
    const tokenName = 'CognitoIdentityServiceProvider.' + clientId + '.' + user;
    const authToken = localStorage.getItem(tokenName + '.idToken');

    return authToken;
}

export function getUserInfo() {
    const payload = JSON.parse(localStorage.getItem('user-info'));

    return payload;
}   