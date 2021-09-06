import { clientId } from './constants';


export function getToken() {
    const user = localStorage.getItem('CognitoIdentityServiceProvider.' + clientId + '.LastAuthUser');
    const tokenName = 'CognitoIdentityServiceProvider.' + clientId + '.' + user;
    const authToken = localStorage.getItem(tokenName + '.accessToken');

    return authToken;
}