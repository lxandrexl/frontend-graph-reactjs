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
    Paper
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import TimerIcon from '@material-ui/icons/Timer';
import { AlarmCalendar, AlarmChart } from '../components/alarm/alarm';
import moment from 'moment';
import ScrollContainer from 'react-indiana-drag-scroll';

export function StaticsAlarm(){
    const location = useLocation();
    const [openDetail, setOpenDetail] = useState(false);
    const [details, setDetails] = useState([]);
    const {
        a,
        st,
        imei,
        fabrica,
        grupo,
        unidad,
        descripcion,
        fecha
    } = useMemo(() => QueryParse(location.search), []);

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
                                    maxHeight: 380
                                }}>
                                    <Stack spacing={1.5}>
                                {
                                    new Array(5).fill('2022-03-05 00:01:00').map((element) => {
                                        return (
                                            <Paper elevation={2} sx={{
                                                boxSizing: 'border-box',
                                                p: 2
                                            }}>
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <TimerIcon size="small" color="error" />
                                                    <Typography variant="body2">
                                                    {element}
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
                            <Typography variant="h4">Estadística de Alarma</Typography>
                        </Box>
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle2">C&oacute;digo:</Typography>
                                <Typography variant="caption">{`${imei}#${a}#${st}#${fabrica}`}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle2">Descripci&oacute;n:</Typography>
                                <Typography variant="caption">{descripcion}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle2">Grupo:</Typography>
                                <Typography variant="caption">{grupo}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle2">Unidad:</Typography>
                                <Typography variant="caption">{unidad}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle2">Fecha:</Typography>
                                <Typography variant="caption">{fecha}</Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                    <Paper square elevation={5} sx={{ p: 2 }}>
                        <Stack spacing={3}>
                            <Stack spacing={1}>
                                <Typography variant="subtitle1">Cantidad de alarmas por hora</Typography>
                                <Typography variant="body2">Intervalo con mayor cantidad de alarmas: 00:00</Typography>
                            </Stack>
                            <Box sx={{
                                overflowX: 'auto',
                                overflowY: 'hidden'
                            }}>
                                <ScrollContainer
                                    vertical={false}
                                    className="scroll-container"
                                    style={{
                                        cursor: 'move'
                                    }}
                                >
                                    <AlarmChart onClick={({x}) => {
                                        console.log(x)
                                        setOpenDetail(true)
                                    }} />
                                </ScrollContainer>
                            </Box>
                        </Stack>
                    </Paper>
                </Stack>
            </Box>
        </>
    );
}

export default function AlarmPage(){
    const location = useLocation();
    const navigate = useNavigate();
    const [year, setYear] = useState(moment().year());
    const [refresh, setRefresh] = useState(false);
    const [data, setData] = useState({});
    const {
        a,
        st,
        imei,
        fabrica,
        grupo,
        unidad,
        descripcion
    } = useMemo(() => QueryParse(location.search), []);

    const listDates = useMemo(() => {
        const yy = moment();
        const mm = year < yy.year() ? 12 : yy.month() + 1;
        return [...Array(mm).keys()]
            .map((element) => `${year}-${(element+1).toString().padStart(2, '0')}-01`)
            .reverse();
    }, [year]);

    useEffect(() => {
        setData({
            3: ['2022-03-05']
        });
    }, [year, refresh]);

    function onSelected(date){
        const query = stringify({
            a,
            st,
            imei,
            fabrica,
            grupo,
            unidad,
            descripcion,
            fecha: date
        });
        navigate(`./statistics?${query}`);
    }

    return (
        <>
            <Box sx={{width: '100%', px: 2}}>
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Box sx={{display: 'flex', flexFlow: 'row', justifyContent: 'space-between'}}>
                            <Typography variant="h4">Historial de Alarmas</Typography>
                        </Box>
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle2">C&oacute;digo:</Typography>
                                <Typography variant="caption">{`${imei}#${a}#${st}#${fabrica}`}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle2">Descripci&oacute;n:</Typography>
                                <Typography variant="caption">{descripcion}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle2">Grupo:</Typography>
                                <Typography variant="caption">{grupo}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle2">Unidad:</Typography>
                                <Typography variant="caption">{unidad}</Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                    <Box
                        sx={{
                            display: 'flex',
                            flexFlow: 'row',
                            flexWrap: 'wrap',
                            gap: 3,
                            p: 1,
                            m: 1,
                            bgcolor: 'background.paper',
                            boxSizing: 'border-box'
                        }}
                    >
                        {
                            listDates.map((element, i) => {
                                const mm = moment(element, 'YYYY-MM-DD').month() + 1;
                                const select = data[mm];
                                return (
                                    <Box sx={{
                                        mb: 3,
                                        flex: '1 1 30.00%'
                                    }}>
                                        <AlarmCalendar
                                            key={i}
                                            date={element}
                                            select={select ?? []}
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