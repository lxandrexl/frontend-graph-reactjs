import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
import infoFill from '@iconify/icons-eva/info-fill';
import barChart2Fill from '@iconify/icons-eva/bar-chart-2-fill';

// material
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText, Link } from '@material-ui/core';
import GraphicDevice from '../../../pages/devices/graphics/graphic';

// ----------------------------------------------------------------------

export default function UserMoreMenu(props) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const type = props.type;
  const device = props.device;
  console.log(props)
  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Icon icon={moreVerticalFill} width={20} height={20} />
      </IconButton>

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
        {/* <MenuItem sx={{ color: 'text.secondary' }}>
          <ListItemIcon>
            <Icon icon={infoFill} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary={type == 'plural' ? "Ver detalles" : "Ver detalle"} primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem> */}

        <MenuItem component={RouterLink} to="#" sx={{ color: 'text.secondary' }}>
          <ListItemIcon> <Icon icon={barChart2Fill} width={24} height={24} /> </ListItemIcon>
          <Link 
            to='/graphic'
            state={{device: device, type: type}}
            color="inherit" underline="none" component={RouterLink}>
              {type == 'plural' ? "Ver graficos" : "Ver grafico"}
          </Link>
        </MenuItem>
      </Menu>
    </>
  );
}
