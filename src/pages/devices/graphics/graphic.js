// material
import { Box, Grid, Container, Typography } from '@material-ui/core';
//
import * as moment from 'moment';
import { useLocation } from 'react-router-dom'
import Page from '../../../components/Page';
import AppWebsiteVisits from '../../../components/_dashboard/app/AppWebsiteVisits';
import { Fragment } from 'react';


// ----------------------------------------------------------------------
moment.locale('es');

export default function GraphicDevice() {
    const location = useLocation();
    const type = location.state.type;
    const device = location.state.device;
    console.log('rs', type , device)
    let devices = [];

    if(type == 'singular') {
        devices.push(device);
    } else if(type == 'plural'){
        devices = device.devices;
    } else if(type == 'checkbox') {
        devices = device;
    } else {
        return 404;
    }

    return (
        <Page title="Dashboard | IoT Fabricas">
            <Container maxWidth="xl">
                <Box sx={{ pb: 5 }}>
                </Box>
                <Grid container spacing={4}></Grid>
                { 
                devices.map((item, i) => {
                    return (
                        <Fragment>
                            <Grid item xs={12} md={12} lg={12} key={i}>
                                <AppWebsiteVisits device={item.device} rule={item.rule[0]} llave={i}/>
                            </Grid>
                            <Grid> &nbsp; </Grid> 
                        </Fragment>
                    )
                })
                }
            </Container>
        </Page>
    )
}
