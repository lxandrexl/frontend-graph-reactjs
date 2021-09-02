// material
import { Box, Grid, Container, Typography } from '@material-ui/core';
// components
import Page from '../components/Page';
import {
  AppWebsiteVisits,
} from '../components/_dashboard/app';

// ----------------------------------------------------------------------

export default function DashboardApp() {
  

  return (
    <Page title="Dashboard | Minimal-UI">
      <Container maxWidth="xl">
        <Box sx={{ pb: 5 }}>
          <Typography variant="h4">Hola, bienvenido de nuevo.</Typography>
        </Box>
        <Grid container spacing={3}>

          <Grid item xs={12} md={12} lg={12}>
            <AppWebsiteVisits />
          </Grid>

        </Grid>
      </Container>
    </Page>
  );
}
