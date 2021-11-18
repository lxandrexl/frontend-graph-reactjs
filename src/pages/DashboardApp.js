// material
import { Box, Grid, Container, Typography } from '@material-ui/core';
import { isNull } from 'lodash';
import { getToken, getRefreshToken, setAccessToken, setToken, setRefreshToken } from 'src/services/tokens';
// components
import Page from '../components/Page';
import {
  AppWebsiteVisits,
} from '../components/_dashboard/app';
import * as moment from 'moment';
import 'moment/locale/es';

import { useNavigate } from 'react-router-dom';
import { getCognitoUser, refreshCognitoToken } from '../services/auth.service';

moment.locale('es');

// ----------------------------------------------------------------------
function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

function checkTokenExp(token, refreshToken) {
  let sessionObs = setInterval(async () => {
    let tokenDecoded = parseJwt(token);
    let time_exp = tokenDecoded.exp * 1000;
    let today = moment().valueOf();
    console.log(today, time_exp, today > time_exp);
    console.log(moment(today).format(), moment(time_exp).format())

    if(today >= time_exp) {
      console.info('El token ha expirado. ('+ token +')');
      let cognitoUser = getCognitoUser(tokenDecoded['cognito:username']);
      let response = await refreshCognitoToken(cognitoUser, refreshToken);
      console.log('Los nuevos tokens son::')
      console.log(response)

      setToken(response.accessToken);
      setAccessToken(response.idToken);
      setRefreshToken(response.refreshToken)

      clearInterval(sessionObs);
      checkTokenExp(getToken(), refreshToken);

      //localStorage.clear();
      //navigate('/login', { replace: true });
    }
  }, 5000);
}

export default function DashboardApp() {
  const navigate = useNavigate();
  let devices;
  let token = getToken();
  let refreshToken = getRefreshToken();

  if(!isNull(token)) { 
    devices = JSON.parse(localStorage.getItem('devices'));
    checkTokenExp(token, refreshToken);
  }
  
  return (
    <Page title="Dashboard | IoT Fabricas">
      <Container maxWidth="xl">
        <Box sx={{ pb: 5 }}>
          <Typography variant="h4">Hola, bienvenido de nuevo.</Typography>
        </Box>
        <Grid container spacing={3}>
        { devices.map((item, i) => 
          <Grid item xs={12} md={12} lg={12} key={i}>
              <AppWebsiteVisits device={item.device} rule={item.rules[0]} llave={i}/>
          </Grid>
        )}
        </Grid>
      </Container>
    </Page>
  );
}
