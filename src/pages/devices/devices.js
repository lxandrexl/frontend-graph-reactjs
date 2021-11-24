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
  TableHead
} from '@material-ui/core';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../../components/_dashboard/user';
//
import USERLIST from '../../_mocks_/user';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import { getToken } from 'src/services/tokens';
import { IndeterminateCheckBox } from '@material-ui/icons';

// ----------------------------------------------------------------------

let DEVICES_ORIGIN = [];
let DEVICES = [];

const TABLE_HEAD = [
  { id: 'Imei', label: 'Imei', alignRight: false },
  { id: 'A', label: 'A', alignRight: false },
  { id: 'ST', label: 'ST', alignRight: false },
  { id: 'Fabrica', label: 'Fabrica', alignRight: false },
  { id: 'Estado', label: 'Estado', alignRight: false },
  { id: '' }
];

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
    return filter(array, (_device) =>  _device.imei.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function User() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  //-----
  let itemsCollapse = [];

  //---- 
  let token = getToken();

  if(!isNull(token)) { 
    DEVICES = JSON.parse(localStorage.getItem('devices'));

    DEVICES = DEVICES.map(({device, rules}) => {
      const imei = device.imei;
      const fabrica = device.fabrica;
      const a = device.a;
      const st = device.st.split('-')[0];

      return { imei, fabrica, a, st, device, rules }
    }).reduce((prev, curr) => {
      let key = curr.imei + '#' + curr.a + '#' + curr.st + '#' + curr.fabrica;
      if(!prev[key]) prev[key] = []
      prev[key].push(curr);
      return prev;
    }, {});

    DEVICES = Object.values(DEVICES);


    DEVICES = DEVICES.map((items) => {
      let devs = items.map((item) => { return { device: item.device, rule: item.rules } });

      const deviceId = items[0].imei + '#' + items[0].a + '#' + items[0].st + '#' + items[0].fabrica;

      itemsCollapse.push({ status: false, deviceId });

      return {
        imei: items[0].imei,
        a: items[0].a,
        st: items[0].st,
        fabrica: items[0].fabrica,
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
    if (event.target.checked) {
      const newSelecteds = DEVICES.map((items) => items);
      console.log(newSelecteds);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
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


  return (
    <Page title="Dispositivos | IoT Fabricas">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Dispositivos
          </Typography>
          <Button
              style={{ margin: '0 10px 20px 0' }}
              variant="contained"
              color="primary"
              startIcon={<AutorenewIcon />}
              //onClick={() => setLoading(true)}
            >
              Actualizar
            </Button>
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
                  rowCount={DEVICES.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, positionRow) => {
                      //const index = (positionRow + 1) + (page * rowsPerPage);
                      const { imei, a, st, fabrica, devices } = row;
                      const deviceId = imei + '#' + a + '#' + st + '#' + fabrica;
                      const isItemSelected = selected.indexOf(deviceId) !== -1;

                      return (
                        <Fragment>
                        <TableRow
                          hover
                          key={deviceId}
                          tabIndex={-1}
                          role="checkbox"
                          selected={isItemSelected}
                          aria-checked={isItemSelected}
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
                                {imei}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">{a}</TableCell>
                          <TableCell align="left">{st}</TableCell>
                          <TableCell align="left">{fabrica}</TableCell>
                          <TableCell align="left">
                            <Label
                              variant="ghost"
                              color={'success'}
                            >
                              {sentenceCase("Estable")}
                            </Label>
                          </TableCell>

                          <TableCell align="right">
                            <UserMoreMenu type={'plural'}/>
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
                                  <TableCell>Codigo</TableCell>
                                  <TableCell>Descripción</TableCell>
                                  <TableCell>Grupo</TableCell>
                                  <TableCell>Unidad</TableCell>
                                  <TableCell>Estado</TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {
                                  devices.map(({device, rule}, subIndex) => (
                                    <TableRow key={subIndex}>
                                      <TableCell component="th" scope="row">
                                        <Checkbox
                                          checked={isItemSelected}
                                          onChange={(event) => handleClick(event, device.deviceId)}
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
                                        <Label
                                          variant="ghost"
                                          color={'success'}
                                        >
                                          {sentenceCase("Estable")}
                                        </Label>
                                      </TableCell>
                                      <TableCell align="right">
                                        <UserMoreMenu type={'single'}/>
                                      </TableCell>
                                    </TableRow>
                                  ))
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
  );
}
