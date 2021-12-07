import { filter, isNull } from 'lodash';
import { sentenceCase } from 'change-case';
import { useState, Fragment, useEffect } from 'react';
import { Icon } from '@iconify/react';
import chevronDownFill from '@iconify/icons-eva/chevron-down-fill';
import chevronUpFill from '@iconify/icons-eva/chevron-up-fill';
// material
import {
  Card,
  Table,
  Stack,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  IconButton,
  Collapse,
  TableHead,
  Link
} from '@material-ui/core';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../../components/_dashboard/user';
//
import { getToken, getAccessToken } from 'src/services/tokens';
import { getStatsData, getAlertsData } from 'src/services/device.service';
import CircularProgress from '@material-ui/core/CircularProgress';

import { Link as RouterLink } from 'react-router-dom';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import Box from '@material-ui/core/Box';
import { timeIntervalPerMinute } from 'src/services/constants'
import * as moment from 'moment-timezone';
import 'moment/locale/es';

moment.locale('es');
// ----------------------------------------------------------------------

let DEVICES = [];
let DEVICES_ID = [];
let firstLoad = true;
let firstLoadAlert = true;

// -- last time data updated
let today =  moment().tz('America/Lima').format('YYYY-MM-DD HH:mm:ss'); 


const TABLE_HEAD = [
  { id: 'Grupo', label: 'Grupo', alignRight: false },
  { id: 'Imei', label: 'Imei', alignRight: false },
  { id: 'Estado', label: 'Estado', alignRight: false },
  { id: '' }
];

function getLastTimeFormat() {
  //let lastTimeLoadedStats = moment().format('dddd DD [de] MMMM [del] YYYY [a las] HH:mm:ss');
  let datetime = moment().format('dddd DD [de] MMMM [a las] HH:mm:ss');
  //datetime = datetime[0].toUpperCase() + datetime.substring(1);

  return datetime;
}

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_device) =>  _device.grupo.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Devices() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState([]);
  const [alertData, setAlertData] = useState([]);
  const [count, setCount] = useState(0);
  const [lastTimeLoadedStats, setLastTimeLoadedStats] = useState(getLastTimeFormat());

  //-----
  let itemsCollapse = [];
  let totalRows = 0;

  //---- 
  let token = getToken();

  // Loading view
  useEffect(async () => {
    if (!loading) return;
    const stats = await getStatsData(getAccessToken());
    setStatsData(stats.data);

    if(firstLoadAlert) {
      const lastTime = '';
      const isLoaded = false;
      const alerts = await getAlertsData(getToken(), today, lastTime, isLoaded, DEVICES_ID);
      setAlertData(alerts.data);
      firstLoadAlert = false;
    }

    setLoading(false);
  }, [loading]);

  useEffect(() => {
      //console.log('==> useEffect alertdata', alertData)
  }, [alertData]);

  if(!isNull(token)) { 
    let devices_storage = JSON.parse(localStorage.getItem('devices'));

   if(firstLoad) {
      DEVICES_ID = devices_storage.map(({device, rules}) => {
        return device.deviceId;
      })
      firstLoad = false;
   }

    DEVICES = devices_storage.map(({device, rules}) => {
      const imei = device.imei;
      const fabrica = device.fabrica;
      const a = device.a;
      const st = device.st.split('-')[0];
      const grupo = device.grupo;

      return { imei, fabrica, a, st, grupo, device, rules }
    }).reduce((prev, curr) => {
      let key = curr.imei + '#' + curr.grupo; 
      if(!prev[key]) prev[key] = []
      prev[key].push(curr);
      return prev; 
    }, {});

    DEVICES = Object.values(DEVICES);


    DEVICES = DEVICES.map((items) => {
      let devs = items.map((item) => { 
        totalRows++;

        return { device: item.device, rule: item.rules }
       });

      const deviceId = items[0].imei + '#' + items[0].a + '#' + items[0].st + '#' + items[0].fabrica;

      itemsCollapse.push({ status: false, deviceId });

      return {
        imei: items[0].imei,
        a: items[0].a,
        st: items[0].st,
        fabrica: items[0].fabrica,
        grupo: items[0].grupo,
        devices: devs
      }
    });

  }

  const [open, setOpen] = useState(itemsCollapse);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    //console.log(event.target.checked)
    if (event.target.checked) {
      let devices = [];
      DEVICES.forEach((items) => devices.push(...items.devices));

      setSelected(devices);
      return;
    }
    setSelected([]);
  };

  // Groups selected
  useEffect(() => {
     //console.log("Nueva data ->", selected)
  }, [selected]);

  // Stats 
  useEffect(() => {
    //console.log('Data cargada (Stats) ->', statsData)
  }, [statsData]);

  const handleClick = (event, item) => {
    const selectedIndex = selected.findIndex(e => e.device.deviceId == item.device.deviceId);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, item);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - DEVICES.length) : 0;

  const filteredUsers = applySortFilter(DEVICES, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  const collapseTable = (deviceId) => {
    let items = open.map((item) => {
      return {
        status: item.deviceId == deviceId ? !item.status : item.status,
        deviceId: item.deviceId
      }
    });
    
    setOpen(items);
  }

  const checkCollapse = (deviceId) => {
    let status;

    for(let item of open) {
      if(item.deviceId == deviceId) {
        status = item.status;
      }
    }
    
    return status;
  }

  const checkStatus = (data, isGroup) => {
    let status = true;
    let notifications = [];

    if(isGroup) {
      for(let alert of alertData) {
        const alertDeviceID = alert.deviceId;

        for(let item of data.devices) {
          const deviceId = item.device.deviceId;

          if(alertDeviceID === deviceId) {
            notifications = alert.data;
            status = false;
            break;
          }
        }
      }

    } else {
      for(let alert of alertData) {
        const alertDeviceID = alert.deviceId;

        if(alertDeviceID === data.deviceId) {
          notifications = alert.data;
          status = false;
          break;
        }
      }
     // console.log('alert data =>',notifications)
    }
    

    return { status, notifications };
  }

  useEffect(() => {
    const timer = setInterval(async () => {
      // Logica ...
      setCount(c => c + 1);

    }, timeIntervalPerMinute * 60000);

    return () => {
      clearInterval(timer);
    }
  }, []);

  useEffect(async() => {
    if(count == 30) {
      setAlertData([]);
      setCount(0);
    }

    if(!firstLoadAlert) {
      const lastTime = today;
      today =  moment().tz('America/Lima').format('YYYY-MM-DD HH:mm:ss'); 
      const isLoaded = true;
      const { data } = await getAlertsData(getToken(),today,lastTime, isLoaded, DEVICES_ID);

      for(let newData of data) {
        let nDeviceId = newData.deviceId;
        let nData = newData.data;
        let nTs = newData.ts;
        let status = newData.status;
        // Variable que indica si se detecto una notificacion nueva de otro sensor fuera del array antiguo.
        let findDeviceId = false;

        for(const [index, oldData] of alertData.entries()) {
          let oDeviceId = oldData.deviceId;
          let oData = oldData.data;

          if(nDeviceId == oDeviceId) {
            let item = {
              deviceId: nDeviceId,
              ts: nTs,
              status,
              data: [...oData, ...nData]
            }
            alertData.splice(index, 1);
            alertData.push(item)

            findDeviceId = true;
          }
        }

        if(!findDeviceId) {
          alertData.push(newData);
        }

      }

      setAlertData(alertData);
      setLastTimeLoadedStats(getLastTimeFormat());
    }
  }, [count])

  // ALERTS SERVICE
  useEffect(() => {
    //console.log('alertData useEffect =>', alertData)
  }, [alertData])

  return (
    <div style={{ width: '100%' }}>
      {loading ? (
        <div className="loading">
          <CircularProgress />
        </div>
      ) : (
        <>
          <Page title="Dispositivos | IoT Fabricas">
            <Container>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0}>
                <Typography variant="h4" gutterBottom>
                  Dispositivos
                </Typography>     
                <Box display="flex" justifyContent="flex-end">       
                  {
                    selected.length > 0 ? 
                    <Button
                      style={{ margin: '0 10px 20px 0' }}
                      variant="contained"
                      color="primary"
                      //onClick={() => setLoading(true)}
                    >
                      <Link 
                        to='/dashboard/graphic'
                        state={{device: selected, type: 'checkbox'}}
                        color="inherit" underline="none" component={RouterLink}>
                          Ver Graficos ({selected.length})
                      </Link>
                    </Button> :
                    null
                  }
                  <Button
                    style={{ margin: '0 10px 20px 0' }}
                    variant="contained"
                    color="primary"
                    startIcon={<AutorenewIcon />}
                    onClick={() => setLoading(true)}
                  >
                    Actualizar Estadísticas
                  </Button>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography>
                  Notificaciones actualizadas por ultima vez el { lastTimeLoadedStats }
                </Typography>
              </Stack>

              <Card>
                <UserListToolbar
                  numSelected={selected.length}
                  filterName={filterName}
                  onFilterName={handleFilterByName}
                />

                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={totalRows}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />
                      <TableBody>
                        {filteredUsers
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row, positionRow) => {
                            const index = (positionRow + 1) + (page * rowsPerPage);
                            const { imei, a, st, fabrica, grupo, devices } = row;
                            const deviceId = imei + '#' + a + '#' + st + '#' + fabrica;
                            const alertGroup = checkStatus(row, true);


                            return (
                              <Fragment>
                              <TableRow
                                hover
                                key={deviceId}
                                tabIndex={-1}
                              >
                                <TableCell>
                                  <IconButton
                                    aria-label="expand row"
                                    size="small"
                                    onClick={() => collapseTable(deviceId)}
                                  >
                                    <Icon icon={ open ? chevronUpFill : chevronDownFill} width={20} height={20} />
                                  </IconButton>
                                </TableCell>
                                <TableCell component="th" scope="row" padding="none">
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="subtitle2" noWrap>
                                      {grupo}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell align="left">{imei}</TableCell>
                                <TableCell align="left">
                                  {
                                    alertGroup.status ? (
                                      <Label
                                      variant="ghost"
                                      color={'success'}
                                    >
                                      {sentenceCase("Estable")}
                                    </Label>
                                    ) : (
                                      <Label
                                      variant="ghost"
                                      color={'error'}
                                    >
                                      {sentenceCase("Peligro")}
                                    </Label>
                                    )
                                  }
                                </TableCell>

                                <TableCell align="right">
                                  <UserMoreMenu device={row} alerts={alertGroup.notifications} stats={statsData} type={'plural'}/>
                                </TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                  <Collapse in={checkCollapse(deviceId)} timeout="auto" unmountOnExit>
                                  <Typography variant="h6" gutterBottom component="div">
                                    Sensores
                                  </Typography>
                                  <Table size="small" aria-label="purchases">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell>Código</TableCell>
                                        <TableCell>Descripción</TableCell>
                                        <TableCell>Grupo</TableCell>
                                        <TableCell>Unidad</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell></TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {
                                        devices.map((item, subIndex) => {
                                          const device = item.device;
                                          const findDevice = selected.findIndex(e => e.device.deviceId == device.deviceId);
                                          const isItemSelected = findDevice !== -1;
                                          const alertDevice = checkStatus(device, false);

                                          return (
                                            <TableRow 
                                              key={subIndex}
                                              role="checkbox"
                                              selected={isItemSelected}
                                              aria-checked={isItemSelected}
                                              >
                                                <TableCell component="th" scope="row">
                                                  <Checkbox
                                                    checked={isItemSelected}
                                                    onChange={(event) => handleClick(event, item)}
                                                  />
                                                </TableCell>
                                                <TableCell>
                                                  {device.deviceId}
                                                </TableCell>
                                                <TableCell>
                                                  {device.descripcion}
                                                </TableCell>
                                                <TableCell>
                                                  {device.grupo}
                                                </TableCell>
                                                <TableCell>
                                                  {device.unidad_medida}
                                                </TableCell>
                                                <TableCell>
                                                  {
                                                    alertDevice.status ? (
                                                      <Label
                                                      variant="ghost"
                                                      color={'success'}
                                                    >
                                                      {sentenceCase("Estable")}
                                                    </Label>
                                                    ) : (
                                                      <Label
                                                      variant="ghost"
                                                      color={'error'}
                                                    >
                                                      {sentenceCase("Peligro")}
                                                    </Label>
                                                    )
                                                  }
                                                </TableCell>
                                                <TableCell align="right">
                                                  <UserMoreMenu device={item} alerts={alertDevice.notifications} stats={statsData} type={'singular'}/>
                                                </TableCell>
                                              </TableRow>
                                          )
                                        })
                                      }
                                    </TableBody>
                                  </Table>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                              </Fragment>
                            );
                          })}
                        {emptyRows > 0 && (
                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                          </TableRow>
                        )}
                      </TableBody>
                      {isUserNotFound && (
                        <TableBody>
                          <TableRow>
                            <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                              <SearchNotFound searchQuery={filterName} />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      )}
                    </Table>
                  </TableContainer>
                </Scrollbar>

                <TablePagination
                  rowsPerPageOptions={[1, 2, 3]}
                  component="div"
                  count={DEVICES.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Card>
            </Container>
          </Page>
        </>
      )}
    </div>
  );
}
