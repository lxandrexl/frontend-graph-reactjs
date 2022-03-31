import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { parse as QueryParse, stringify } from 'query-string';
import { 
    Box,
    Typography,
    Stack,
    Fade,
    Modal,
    Backdrop,
    CircularProgress,
    alpha,
    Button,
    Paper,
    Tooltip,
    Select,
    MenuItem,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import TimerIcon from '@material-ui/icons/Timer';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { AlarmCalendar, AlarmHours } from '../components/alarm/alarm';
import { getAlarm } from '../services/alarm.service';
import moment from 'moment';

export function StaticsAlarm(){
    const location = useLocation();
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedDate, setSelectDate] = useState(null);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [details, setDetails] = useState([]);
    const [hourAlerts, setHourAlerts] = useState([]);
    const [loadingHours, setLoadingHours] = useState(false);
    const [loadingExactlyDates, setLoadingExactlyDates] = useState(false);
    const {
        type,
        device,
        date,
        ids
    } = useMemo(() => location.state, []);

    const listDates = useMemo(() => {
        const dates = [...Array(24).keys()]
            .map((element) => `${(element).toString().padStart(2, '0')}:00`);
        return (dates ?? []).map((element) => {
            return {
                x: element
            }
        })
    }, []);

    useEffect(() => {
        if(type === 'singular'){
            setSelectedDevice(device.device.deviceId);
        }
    }, [type]);

    useEffect(async () => {
        if(!date || !selectedDevice) return;
        setLoadingHours(true);
        const r = await getAlarm(stringify({
            action: 'by_day',
            date,
            device: selectedDevice
        }));
        setHourAlerts(r.payload);
        setLoadingHours(false);
    }, [date, selectedDevice]);

    useEffect(async () => {
        if(!selectedDate || !selectedDevice) return;
        setLoadingExactlyDates(true);
        const r = await getAlarm(stringify({
            action: 'by_hour',
            date: selectedDate,
            device: selectedDevice
        }));
        setDetails(r.payload);
        setLoadingExactlyDates(false);
    }, [selectedDate]);

    return (
        <>
            <Box sx={{width: '100%', px: 2}}>
                <Modal
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    open={openDetail}
                    onClose={() => {setOpenDetail(false)}}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                        timeout: 500,
                    }}
                >
                    <Fade in={openDetail}>
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 320,
                            bgcolor: 'background.paper',
                            p: 4,
                            outline: 0
                        }}>
                            <Stack spacing={2}>
                                <Stack justifyContent="space-between" direction="row" alignItems="center">
                                    <Typography id="transition-modal-title" variant="h6" component="h2">
                                    Fechas de alarma
                                    </Typography>
                                    <CloseIcon 
                                        sx={{
                                            cursor: 'pointer'
                                        }} 
                                        onClick={() => {
                                            setOpenDetail(false);
                                        }}
                                    />
                                </Stack>
                                <Box sx={{
                                    overflowY: 'auto',
                                    boxSizing: 'border-box',
                                    p: .5,
                                    minHeight: 100,
                                    maxHeight: 380,
                                    position: 'relative'
                                }}>
                                    <Backdrop
                                        sx={{ 
                                            background: alpha('#FFF', 0.85), 
                                            zIndex: (theme) => theme.zIndex.drawer + 1,
                                            position: 'absolute',
                                        }}
                                        open={loadingExactlyDates}
                                        >
                                        <CircularProgress color="inherit" />
                                    </Backdrop>
                                    <Stack spacing={1.5}>
                                    {
                                        details.map((element) => {
                                            return (
                                                <Paper elevation={2} sx={{
                                                    boxSizing: 'border-box',
                                                    p: 2
                                                }}>
                                                    <Stack direction="row" alignItems="center" spacing={2}>
                                                        <TimerIcon size="small" color="error" />
                                                        <Typography variant="body2">
                                                        {moment(element.fecha, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY HH:mm:ss')}
                                                        </Typography>
                                                    </Stack>
                                                </Paper>
                                            );
                                        })
                                    }
                                    </Stack>
                                </Box>
                            </Stack>
                        </Box>
                    </Fade>
                </Modal>
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Box sx={{display: 'flex', flexFlow: 'row', justifyContent: 'space-between'}}>
                            <Typography variant="h4">Hora de Alarma</Typography>
                        </Box>
                        {
                            type === 'plural' ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="subtitle2">Fecha seleccionada:</Typography>
                                    <Typography variant="caption">{date}</Typography>
                                </Stack>
                            ) : null
                        }
                    </Stack>
                    {
                        type === 'singular' ? (
                            <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="subtitle2">C&oacute;digo:</Typography>
                                    <Typography variant="caption">{device.device.deviceId}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="subtitle2">Descripci&oacute;n:</Typography>
                                    <Typography variant="caption">{device.device.descripcion}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="subtitle2">Grupo:</Typography>
                                    <Typography variant="caption">{device.device.grupo}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="subtitle2">Unidad:</Typography>
                                    <Typography variant="caption">{device.device.unidad_medida}</Typography>
                                </Stack>
                            </Stack>
                        ) : null
                    }
                    {
                        type === 'plural' && device.devices.filter((element) => {
                            const {deviceId} = element.device;
                            return ids.some((element) => {
                                return element === deviceId;
                            })
                        }).map((element) => {
                            const {deviceId, descripcion, grupo, unidad_medida} = element.device;
                            return (
                                <Paper square elevation={5} sx={{ p: 2 }}>
                                <Accordion expanded={deviceId === selectedDevice} onChange={(e, expand) => {
                                    if(expand){
                                        setSelectedDevice(deviceId);
                                    }else{
                                        setDetails([]);
                                        setSelectedDevice(null);
                                    }
                                }}>
                                    <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                    >
                                        <Stack spacing={1}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="subtitle2">Código:</Typography>
                                                <Typography variant="caption">{deviceId}</Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="subtitle2">Descripción:</Typography>
                                                <Typography variant="caption">{descripcion}</Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="subtitle2">Grupo:</Typography>
                                                <Typography variant="caption">{grupo}</Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="subtitle2">Unidad:</Typography>
                                                <Typography variant="caption">{unidad_medida}</Typography>
                                            </Stack>
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack spacing={2.5}>
                                            {/* <Stack spacing={1}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography variant="subtitle2">Grupo:</Typography>
                                                    <Typography variant="caption">{grupo}</Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography variant="subtitle2">Unidad:</Typography>
                                                    <Typography variant="caption">{unidad_medida}</Typography>
                                                </Stack>
                                            </Stack> */}
                                            <Paper square elevation={5} sx={{ p: 2, position: 'relative' }}>
                                                <Backdrop
                                                    sx={{ 
                                                        background: alpha('#FFF', 0.85), 
                                                        zIndex: (theme) => theme.zIndex.drawer + 1,
                                                        position: 'absolute',
                                                    }}
                                                    open={loadingHours}
                                                    >
                                                    <CircularProgress color="inherit" />
                                                </Backdrop>
                                                <AlarmHours
                                                    fecha={date}
                                                    hourAlerts={hourAlerts}
                                                    listDates={listDates}
                                                    onSelect={(e) => {
                                                        setSelectDate(e);
                                                        setOpenDetail(true);
                                                        console.log(e)
                                                    }}
                                                />
                                            </Paper>
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                                </Paper>
                            );
                        })
                    }
                    {
                        type === 'singular' ? (
                            <Paper square elevation={5} sx={{ p: 2, position: 'relative' }}>
                                <Backdrop
                                    sx={{ 
                                        background: alpha('#FFF', 0.85), 
                                        zIndex: (theme) => theme.zIndex.drawer + 1,
                                        position: 'absolute',
                                    }}
                                    open={loadingHours}
                                    >
                                    <CircularProgress color="inherit" />
                                </Backdrop>
                                <AlarmHours
                                    fecha={date}
                                    hourAlerts={hourAlerts}
                                    listDates={listDates}
                                    onSelect={(e) => {
                                        setSelectDate(e);
                                        setOpenDetail(true);
                                        console.log(e)
                                    }}
                                />
                            </Paper>
                        ) : null
                    }
                </Stack>
            </Box>
        </>
    );
}

export default function AlarmPage(){
    const location = useLocation();
    const navigate = useNavigate();
    const [year, setYear] = useState(moment().year());
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const {
        type,
        device
    } = useMemo(() => location.state, []);

    const intervalYears = useMemo(() => {
        const yy = [];
        for(let i = moment().year(); i >= 2021; i--){
            yy.push(i);
        }
        return yy;
    }, []);

    const listDates = useMemo(() => {
        const yy = moment();
        const mm = year < yy.year() ? 12 : yy.month() + 1;
        return [...Array(mm).keys()]
            .map((element) => `${year}-${(element+1).toString().padStart(2, '0')}-01`)
            .reverse();
    }, [year]);

    useEffect(async () => {
        setLoading(true);
        const devices = type === 'plural' ? device.devices.map((element) => {
            return element.device.deviceId;
        }) : [device.device.deviceId]
        const qq = stringify({
            action: 'by_year',
            date: year,
            device: devices
        });
        const r = await getAlarm(qq);
        setData(r.payload);
        setLoading(false);
    }, [year]);

    function onSelected({date, ids}){
        navigate(`./statistics`, {
            state: {
                type,
                device,
                date,
                ids
            }
        });
    }

    return (
        <>
            <Box sx={{width: '100%', px: 2}}>
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Box sx={{display: 'flex', flexFlow: 'row', justifyContent: 'space-between'}}>
                            <Typography variant="h4">Historial de Alarmas</Typography>
                        </Box>
                        {
                            type === 'singular' ? (
                                <Stack spacing={1}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="subtitle2">C&oacute;digo:</Typography>
                                        <Typography variant="caption">{device.device.deviceId}</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="subtitle2">Descripci&oacute;n:</Typography>
                                        <Typography variant="caption">{device.device.descripcion}</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="subtitle2">Grupo:</Typography>
                                        <Typography variant="caption">{device.device.grupo}</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="subtitle2">Unidad:</Typography>
                                        <Typography variant="caption">{device.device.unidad_medida}</Typography>
                                    </Stack>
                                </Stack>
                            ) : null
                        }
                    </Stack>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2">Seleccionar año</Typography>
                            <Select value={year} onChange={(event) => setYear(event.target.value)}>
                                {
                                    intervalYears.map((element) => {
                                        return <MenuItem value={element}>{element}</MenuItem>
                                    })
                                }
                            </Select>
                        </Stack>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexFlow: 'row',
                            flexWrap: 'wrap',
                            gap: 3,
                            p: 1,
                            m: 1,
                            bgcolor: 'background.paper',
                            boxSizing: 'border-box',
                            position: 'relative'
                        }}
                    >
                        <Backdrop
                            sx={{ 
                                background: alpha('#FFF', 0.85), 
                                zIndex: (theme) => theme.zIndex.drawer + 1,
                                position: 'absolute',
                            }}
                            open={loading}
                            >
                            <CircularProgress color="inherit" />
                        </Backdrop>
                        {
                            listDates.map((element, i) => {
                                return (
                                    <Box sx={{
                                        mb: 3,
                                        flex: '1 1 30.00%'
                                    }}>
                                        <AlarmCalendar
                                            key={i}
                                            date={element}
                                            select={data ?? []}
                                            onSelected={onSelected}
                                        />
                                    </Box>
                                )
                            })
                        }
                    </Box>
                </Stack>
            </Box>
        </>
    );
}