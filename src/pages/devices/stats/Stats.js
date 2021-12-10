import React from 'react';
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

export function StatsTable({ stats }) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell align="center">Mayor</TableCell>
            <TableCell align="center">Promedio</TableCell>
            <TableCell align="center">Menor</TableCell>
            <TableCell align="center">Lecturas</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stats.map((row) => (
            <TableRow key={row.fecha}>
              <TableCell component="th" scope="row">
                {row.fecha}
              </TableCell>
              <TableCell align="center">
                <div className={row.alertMax ? 'alert' : null}>{row.max}</div>
              </TableCell>
              <TableCell align="center">{row.promedio}</TableCell>
              <TableCell align="center">
                <div className={row.alertMin ? 'alert' : null}>{row.min}</div>
              </TableCell>
              <TableCell align="center">{row.lecturas}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function UmbralInfo({ detail, value }) {
  return (
    <div className="umbral-info">
      <div>
        <div className="umbral-info__value">{value}</div>
        <div className="umbral-info__detail">{detail}</div>
      </div>
    </div>
  );
}

export function BoxStats({ stats, umbral, unidad, grupo, descripcion, imei, a, st }) {
  return (
    <div className="ppx">
      <Box>
        <Typography variant="h5" component="h2">
          {descripcion || grupo}
        </Typography>
        <Box
          display="flex"
          flexWrap="nowrap"
          justifyContent="space-between"
          style={{ width: '100%', paddingBottom: '8px' }}
        >
          <div>
            <div>
              <Typography
                style={{ fontSize: '12px', paddingTop: '5px' }}
                color="textSecondary"
                gutterBottom
              >
                IMEI: {imei}
              </Typography>
            </div>
            <div>
              <Typography
                style={{ fontSize: '12px', paddingTop: '5px' }}
                color="textSecondary"
                gutterBottom
              >
                Grupo: {grupo}
              </Typography>
            </div>
            <div>
              <Typography
                style={{ fontSize: '12px', paddingTop: '5px' }}
                color="textSecondary"
                gutterBottom
              >
                Unidad Medida: {unidad}
              </Typography>
            </div>
            <div>
              <Typography
                style={{ fontSize: '12px', paddingTop: '5px' }}
                color="textSecondary"
                gutterBottom
              >
                A: {a} &nbsp; &nbsp; ST: {st}
              </Typography>
            </div>
          </div>
          <Box
            display="flex"
            style={{
              padding: '15px',
              background: '#F3EFEF',
              borderRadius: '3px',
              boxShadow: '0 0 1px #CCC'
            }}
            bgcolor="background.paper"
          >
            <UmbralInfo detail="Umbral Max" value={umbral ? umbral.umbralMaximo : 0} />
            <UmbralInfo detail="Umbral Min" value={umbral ? umbral.umbralMinimo : 0} />
          </Box>
        </Box>
        <StatsTable stats={stats} />
      </Box>
    </div>
  );
}

export default function Stats({ data }) {

  return (
        <>
          <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="space-around"
            bgcolor="background.paper"
          >
            {data.map((element, index) => (
              <BoxStats
                key={'element-' + index}
                stats={element.stats}
                umbral={element.umbral}
                unidad={element.unidad_medida}
                grupo={element.grupo}
                imei={element.imei}
                descripcion={element.descripcion}
                a={element.a}
                st={element.st}
              />
            ))}
          </Box>
        </>
  );
}
