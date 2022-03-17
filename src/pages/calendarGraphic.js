import { useState } from 'react';
import { 
    Typography,
    Stack,
    TextField,
} from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import MobileDateTimePicker from '@material-ui/lab/MobileDateTimePicker';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import AdapterMoment from '@material-ui/lab/AdapterMoment';

export default function CalendarGraphic(props) {
    
    console.log("props => ",props)

    const navigate = useNavigate();       

    function Redirigir(){       

        navigate(
            '/dashboard/daily-graphic',
            {
                state: {
                    device: props.datos.device, 
                    type: props.datos.type,
                    dateGraphic:fromDate?.format('YYYY-MM-DD')
                }
            }
        ); 
        
        if(props.estado===2)
            window.location.reload(false);
                   
    }
    
    const [fromDate, setFromDate] = useState(null);
    return (
        <>            
            <Stack spacing={1} sx={{
                flex: 1
            }}>
                <Typography variant="subtitle2">Día: </Typography>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <MobileDateTimePicker
                        renderInput={(props) => <TextField placeholder='Seleccionar fecha' variant="outlined" {...props} />}
                        value={fromDate}
                        onChange={(newValue) => {
                            setFromDate(newValue);
                        }}
                        inputFormat={'YYYY-MM-DD'}
                        views={['year', 'month', 'day']}
                        cancelText='Cancelar'
                        okText='Aceptar'
                        toolbarTitle='Seleccionar día'
                        onAccept={Redirigir}
                        maxDate={new Date()}
                    />
                </LocalizationProvider>
            </Stack>                     
        </>
    );
}

