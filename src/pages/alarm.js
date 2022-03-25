import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { parse as QueryParse, stringify } from 'query-string';
import { 
    Box,
    Button,
    Typography,
    Stack,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TextField,
    Modal,
    Backdrop,
    CircularProgress,
    alpha
} from '@material-ui/core';
import { AlarmCalendar } from '../components/alarm/alarm';
import moment from 'moment';

export function StaticsAlarm(){
    const location = useLocation();
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
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Box sx={{display: 'flex', flexFlow: 'row', justifyContent: 'space-between'}}>
                            <Typography variant="h4">Estadistica de Alarma</Typography>
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
                    <div>a</div>
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
                            <Typography variant="h4">Calendario de Alarmas</Typography>
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