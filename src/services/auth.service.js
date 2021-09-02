import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { clientId, userPoolId } from './constants';

export async function loginService(payload) {
   return new Promise(function(resolve, reject) {
        const poolData = {
            UserPoolId: userPoolId,
            ClientId: clientId
        }

        const UserPool = new CognitoUserPool(poolData);

        const cognitoUser = new CognitoUser({ Username: payload.email, Pool: UserPool });

        const authDetails = new AuthenticationDetails({ Username: payload.email, Password: payload.password });

        cognitoUser.authenticateUser(authDetails, {
            onSuccess: data => {
                console.log('onSuccess', data)
                resolve(data);
            },

            onFailure: error => {
                console.error('onFailure', error)
                reject(error);
            },

            newPasswordRequired: () => {
                console.log(cognitoUser);
                console.log(cognitoUser.getAuthenticationFlowType(), 'YOU NEED TO CHANGE PASSWORD');
            
                cognitoUser.completeNewPasswordChallenge(
                'P@ssword123',
                {},
                {
                    onSuccess: (data) => {
                    console.log('success_newpass', data);
                    resolve(data);
                    },
                    onFailure: (error) => {
                        console.log(error);
                        reject(error);
                    },
                },
                );
            }
        });
   })
   
}