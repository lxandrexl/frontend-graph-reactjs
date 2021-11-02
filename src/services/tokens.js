export function setToken(token) {
    localStorage.setItem('token_app', token);
}

export function setAccessToken(token) {
    localStorage.setItem('access_token_app', token);
}

export function setRefreshToken(token) {
    localStorage.setItem('refresh_token_app', token);
}


export function getToken() {
    return localStorage.getItem('token_app');
}

export function getRefreshToken() {
    return localStorage.getItem('refresh_token_app');
}

export function getAccessToken() {
    return localStorage.getItem('access_token_app');
}

export function getUserInfo() {
    const payload = JSON.parse(localStorage.getItem('user-info'));

    return payload;
}   