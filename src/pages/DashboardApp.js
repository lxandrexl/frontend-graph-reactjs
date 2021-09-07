// material
import { Box, Grid, Container, Typography } from '@material-ui/core';
import { isNull } from 'lodash';
import { getToken } from 'src/services/tokens';
// components
import Page from '../components/Page';
import {
  AppWebsiteVisits,
} from '../components/_dashboard/app';

// ----------------------------------------------------------------------

export default function DashboardApp() {
  let devices;

  if(!isNull(getToken())) { 
    devices = JSON.parse(localStorage.getItem('devices'));
  }
  
  return (
    <Page title="Dashboard | Minimal-UI">
      <Container maxWidth="xl">
        <Box sx={{ pb: 5 }}>
          <Typography variant="h4">Hola, bienvenido de nuevo.</Typography>
        </Box>
        <Grid container spacing={3}>
        { devices.map((device, i) => 
          <Grid item xs={12} md={12} lg={12} key={i}>
              <AppWebsiteVisits device={device} llave={i}/>
          </Grid>
        )}
        </Grid>
      </Container>
    </Page>
  );
}
