import { useEffect, useState, useRef } from 'react';
import { isNull, merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
// material
import { Card, CardHeader, Box } from '@material-ui/core';
//
import { BaseOptionChart } from '../../charts';

import * as moment from 'moment';
import {getDeviceData} from 'src/services/device.service';
import { getToken } from 'src/services/tokens';
// ----------------------------------------------------------------------
moment.locale('es');

export default function AppWebsiteVisits({ device, llave, rule }) {
  let titleGraphic = '=)';//`${device.descripcion}`;
  let subtitleGraphic = '=)';//`Codigo de dispositivo: ${device.deviceId}`;

  return (

    <Card>
      <CardHeader title={titleGraphic} subheader={subtitleGraphic} />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
          Hi =)
      </Box>
    </Card>
  );
}
