// material
import { Box, Grid, Container, Typography } from '@material-ui/core';
import { isNull } from 'lodash';
import { getToken } from 'src/services/tokens';
// components
import Page from '../components/Page';
import {
  AppWebsiteVisits,
} from '../components/_dashboard/app';
import * as moment from 'moment';
import { useNavigate } from 'react-router-dom';

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

function checkTokenExp(navigate, token) {
  let sessionObs = setInterval(() => {
    let tokenDecoded = parseJwt(token);
    let time_exp = tokenDecoded.exp * 1000;
    let today = moment().valueOf();
    console.log(today, time_exp, today > time_exp);
    console.log(moment(today).format(), moment(time_exp).format())

    if(today >= time_exp) {
      console.info('El token ha expirado. ('+ token +')');
      
      clearInterval(sessionObs);
      localStorage.clear();
      navigate('/login', { replace: true });
    }
  }, 5000);
}

export default function DashboardApp() {
  const navigate = useNavigate();
  let devices;
  let token = getToken();

  if(!isNull(token)) { 
    devices = JSON.parse(localStorage.getItem('devices'));
    checkTokenExp(navigate, token);
  }
  
  return (
    <Page title="Dashboard | Minimal-UI">
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
