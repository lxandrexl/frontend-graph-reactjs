import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { baseUrl } from '../../services/constants';
import { getAccessToken } from '../../services/tokens';
import Table from '@material-ui/core/Table';
import Button from '@material-ui/core/Button';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import './style.css';
import flechaArribaRoja from './up-red-arrow.png';
import flechaArribaVerde from './up-green-arrow.png';
import flechaAbajoRoja from './down-red-arrow.png';
import flechaAbajoVerde from './down-green-arrow.png';
import iconVerde from './iconVerde.png';
import { getUserInfo } from 'src/services/tokens';

/*********
 * Service API
 */
async function getData() {
  const token = getAccessToken();
  const user = getUserInfo();
  return await axios.post(
    `${baseUrl}/dashboard/pushnotifications`,
    {
      fabrica: user['cognito:groups'][0].toUpperCase()
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}

export function RegistrosTable({ registros }) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Fecha/Hora</TableCell>
            <TableCell align="center">Sensor</TableCell>
            <TableCell align="center">Unidad Medida</TableCell>
            <TableCell align="center">Umbral Min.</TableCell>
            <TableCell align="center">Umbral Max.</TableCell>
            <TableCell align="center">Medición</TableCell>
            <TableCell align="center">Dirección</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {registros.map((row, index) => {
            var flechaMostrar, textoDireccion;
            if (
              parseFloat(row.valorMedido) < parseFloat(row.umbralMaximo) &&
              parseFloat(row.valorMedido) > parseFloat(row.umbralMinimo)
            ) {
              flechaMostrar = iconVerde;
              textoDireccion = 'Aceptable';
            } else {
              if (parseFloat(row.valorMedido) >= parseFloat(row.umbralMaximo)) {
                flechaMostrar = flechaArribaRoja;
              } else {
                flechaMostrar = flechaAbajoRoja;
              }
              textoDireccion = 'Peligro';
            }

            return (
              <TableRow>
                <TableCell component="th" scope="row" align="center">
                  {row.ts}
                </TableCell>
                <TableCell align="center">{row.datosDispositivo.descripcion}</TableCell>
                <TableCell align="center">{row.datosDispositivo.unidadMedida}</TableCell>
                <TableCell align="center">{row.umbralMinimo}</TableCell>
                <TableCell align="center">{row.umbralMaximo}</TableCell>
                <TableCell align="center">{row.valorMedido}</TableCell>
                <TableCell align="center">
                  <span class="stable">{textoDireccion}</span>
                  <img src={flechaMostrar} alt="abajo" class="flecha" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function UmbralInfo({ detail, value }) {
  return (
    <div className="umbral-info">
      <div className="umbral-info__value">{value}</div>
      <div className="umbral-info__detail">{detail}</div>
    </div>
  );
}

export function BoxRegistros({ registros }) {
  return (
    <Box>
      <Typography variant="h5" component="h2">
        Notificaciones
      </Typography>
      <Box
        display="flex"
        flexWrap="nowrap"
        justifyContent="space-between"
        style={{ width: '100%', paddingBottom: '8px' }}
      >
        <div>
          <Typography
            style={{ fontSize: '13px', paddingTop: '5px' }}
            color="textSecondary"
            gutterBottom
          >
            Día actual y 7 días anteriores
          </Typography>
        </div>
      </Box>
      <RegistrosTable registros={registros} />
    </Box>
  );
}

export default function Stats() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fabricaid, setFabricaId] = useState(true);

  useEffect(async () => {
    if (!loading) return;
    const { data } = await getData();
    console.log(data);
    setData(data.payload);
    setLoading(false);
    setFabricaId({ fabrica: data.fabrica, id: data.id });
  }, [loading]);

  return (
    <div style={{ width: '100%' }}>
      {loading ? (
        <div className="loading">
          <CircularProgress />
        </div>
      ) : (
        <>
          <Box display="flex" justifyContent="flex-end">
            <Button
              style={{ margin: '0 10px 20px 0' }}
              variant="contained"
              color="primary"
              startIcon={<AutorenewIcon />}
              onClick={() => setLoading(true)}
            >
              Actualizar
            </Button>
          </Box>
          <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="space-around"
            bgcolor="background.paper"
          >
            <div style={{ width: '100%' }}>
              <BoxRegistros registros={data} />
            </div>
          </Box>
        </>
      )}
    </div>
  );
}
