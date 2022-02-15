import { Icon } from '@iconify/react';
import { useRef, useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {stringify as QueryStringify} from 'query-string';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
import infoFill from '@iconify/icons-eva/info-fill';
import barChart2Fill from '@iconify/icons-eva/bar-chart-2-fill';
import downloadFill from '@iconify/icons-eva/download-fill';

// material
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText, Link } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/styles';
import Stats from 'src/pages/devices/stats/Stats';
import RegistrosTable from 'src/pages/devices/notifications/notifis';

// ----------------------------------------------------------------------
function getModalStyle() {
  const top = 50 ;
  const left = 50 ;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 1000,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    overflow: 'scroll',
    height: '90%',
    display: 'block'
  },
}));

// ----------------------------------------------------------------------


export default function UserMoreMenu(props) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  //const [alerts, setAlerts] = useState([]);
  const type = props.type;
  const device = props.device;  
  const stats = props.stats;
  const alerts = props.alerts;
  
  const pickDeviceQuery = useMemo(() => {
    return {
        imei: device?.device?.imei,
        a: device?.device?.a,
        st: device?.device?.st,
        fabrica: device?.device?.fabrica
    }
  }, []);
  //console.log('ENTRO AL USERMORE', alerts)

  // useEffect(() => {
  //   setAlerts(alert);
  // })

  // useEffect(() => {
  //   console.log('alerts effect', alerts)
  // }, [alerts]);
  
  let statsList = [];

  if(type == 'singular') {
    const deviceId = device.device.deviceId;
    for(let stat of stats) {
      const statDeviceId = stat.imei + '#' + stat.a + '#' + stat.st + '#' + stat.fabrica;

      if(deviceId == statDeviceId) {
        statsList.push(stat);
      }
    }
  } else if (type == 'plural') {
    for(let item of device.devices) {
      const deviceId = item.device.deviceId;

      for(let stat of stats) {
        const statDeviceId = stat.imei + '#' + stat.a + '#' + stat.st + '#' + stat.fabrica;

        if(deviceId == statDeviceId) {
          statsList.push(stat);
        }
      }
    }
  } else {
    console.error('Not found valid type ')
  }

  // ---- Modal ----
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = useState(getModalStyle);
  const [openModal, setOpenModal] = useState(false);
  const [openAlertModal, setOpenAlertModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenAlertModal = () => {
    setOpenAlertModal(true);
  };

  const handleCloseAlertModal = () => {
    setOpenAlertModal(false);
  };

  const modalBody = (data) => (
    <div style={modalStyle} className={classes.paper}>
      <h2 id="simple-modal-title">{ type == 'plural' ? "Estadísticas" : "Estadística" }</h2>
      <br/>
      <span>
        <Stats data={data} />
      </span>
    </div>
  );

  const modalAlertBody = (data, item) => (
    <div style={modalStyle} className={classes.paper}>
      <h2 id="simple-modal-title">Notificaciones</h2>
      <br/>
      <span>
        <RegistrosTable registros={data} device={item} />
      </span>
    </div>
  );


  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Icon icon={moreVerticalFill} width={20} height={20} />
      </IconButton>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {modalBody(statsList)}
      </Modal>


      {
        (type == 'singular') ?
        (
          <Modal
            open={openAlertModal}
            onClose={handleCloseAlertModal}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
          >
            {modalAlertBody(alerts, device)}
          </Modal>
        ) : null
      }

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' }
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {
          (alerts.length > 0 && type == 'singular')  ?
          (
            <MenuItem sx={{ color: 'text.secondary' }}>
              <ListItemIcon>
                <Icon icon={infoFill} width={24} height={24} />
              </ListItemIcon>
              <ListItemText 
                onClick={handleOpenAlertModal}
                primary="Ver Notificaciones"
                primaryTypographyProps={{ variant: 'body2' }} 
              />
            </MenuItem>
          ) : null
        }
        <MenuItem sx={{ color: 'text.secondary' }}>
          <ListItemIcon>
            <Icon icon={infoFill} width={24} height={24} />
          </ListItemIcon>
          <ListItemText 
            onClick={handleOpenModal}
            primary={type == 'plural' ? "Ver estadísticas" : "Ver estadística"} 
            primaryTypographyProps={{ variant: 'body2' }} 
          />
        </MenuItem>

        <MenuItem sx={{ color: 'text.secondary' }}>
          <ListItemIcon> <Icon icon={barChart2Fill} width={24} height={24} /> </ListItemIcon>
          <Link 
            to='/dashboard/graphic'
            state={{device: device, type: type}}
            style={{ fontSize: '0.875rem' }}
            color="inherit" underline="none" component={RouterLink}>
              {type == 'plural' ? "Ver gráficos" : "Ver gráfico"}
          </Link>
        </MenuItem>

        {
          type === 'singular' ? (
            <MenuItem sx={{ color: 'text.secondary' }}>
              <ListItemIcon> <Icon icon={downloadFill} width={24} height={24} /> </ListItemIcon>
              <Link 
                to={`/dashboard/data?${QueryStringify(pickDeviceQuery)}`}
                state={{device: device, type: type}}
                style={{ fontSize: '0.875rem' }}
                color="inherit" underline="none" component={RouterLink}>
                  Exportar datos
              </Link>
            </MenuItem>
          ) : null
        }
      </Menu>
    </>
  );
}
