import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import './style.css';
import flechaArribaRoja from './up-red-arrow.png';
import flechaAbajoRoja from './down-red-arrow.png';

export default function RegistrosTable({ registros, device }) {
  // console.log('registros notif', device, registros)

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
          {registros.map((row) => {
            if(row.direccionCambio !== 'Aceptable') {
              var flechaMostrar;
              if (parseFloat(row.valorMedido) >= parseFloat(row.jsonRegla.umbralMaximo.N)) {
                flechaMostrar = flechaArribaRoja;
              } else {
                flechaMostrar = flechaAbajoRoja;
              }

              return (
                <TableRow>
                  <TableCell component="th" scope="row" align="center">
                    {row.ts}
                  </TableCell>
                  <TableCell align="center">{device.device.descripcion}</TableCell>
                  <TableCell align="center">{device.device.unidad_medida}</TableCell>
                  <TableCell align="center">{row.jsonRegla.umbralMinimo.N}</TableCell>
                  <TableCell align="center">{row.jsonRegla.umbralMaximo.N}</TableCell>
                  <TableCell align="center">{row.valorMedido}</TableCell>
                  <TableCell align="center">
                    <span class="stable">{row.direccionCambio}</span>
                    <img src={flechaMostrar} alt="flecha" class="flecha" />
                  </TableCell>
                </TableRow>
              );
            }
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}