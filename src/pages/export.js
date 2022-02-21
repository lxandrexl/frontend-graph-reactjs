import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router';
import { parse as QueryParse, stringify as QueryStringify } from 'query-string';
import { 
    Box,
    Link,
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
import moment from 'moment';
import Label from '../components/Label';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';
import ReplayIcon from '@material-ui/icons/Replay';
import InfiniteScroll from 'react-infinite-scroll-component';
import DateTimePicker from '@material-ui/lab/DateTimePicker';
import LoadingButton from '@material-ui/lab/LoadingButton';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import AdapterMoment from '@material-ui/lab/AdapterMoment';
import SearchIcon from '@material-ui/icons/Search';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import {getTickets, createTickets} from '../services/export.service';

function NewReport(props){

    const {
        afterSave,
        device: {
            a,
            st,
            imei,
            fabrica
        }
    } = props;
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [loading, setLoading] = useState(false);

    const availableForCreate = useMemo(() => {
        return fromDate && toDate && moment(fromDate).isBefore(moment(toDate))
    }, [fromDate, toDate]);

    async function onSave(){
        try{
            setLoading(true);
            await createTickets({
                a: +a,
                st,
                imei,
                fabrica,
                fromDate: fromDate?.format('YYYY-MM-DD HH:mm:ss'),
                toDate: toDate?.format('YYYY-MM-DD HH:mm:ss')
            });
            afterSave();
        }catch(e){

        }finally{
            setLoading(false);
        }
    }

    return (
        <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'background.paper',
            boxShadow: 2,
            p: 4,
        }}>
            <Stack spacing={2}>
                <Typography variant="h4">Nueva extraccion</Typography>
                <Stack spacing={1}>
                    <Stack direction="row" spacing={3} alignItems="center" justifyContent="flex-end">
                        <Stack spacing={1}>
                            <Typography variant="subtitle2">Desde: </Typography>
                            <LocalizationProvider dateAdapter={AdapterMoment}>
                                <DateTimePicker
                                    renderInput={(props) => <TextField variant="outlined" {...props} />}
                                    value={fromDate}
                                    onChange={(newValue) => {
                                        setFromDate(newValue);
                                    }}
                                />
                            </LocalizationProvider>
                        </Stack>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2">Hasta: </Typography>
                            <LocalizationProvider dateAdapter={AdapterMoment}>
                                <DateTimePicker
                                    renderInput={(props) => <TextField variant="outlined" {...props} />}
                                    value={toDate}
                                    onChange={(newValue) => {
                                        setToDate(newValue);
                                    }}
                                />
                            </LocalizationProvider>
                        </Stack>
                    </Stack>
                </Stack>
                <LoadingButton
                    variant="contained"
                    color="primary"
                    onClick={onSave}
                    disabled={!availableForCreate}
                    loading={loading}
                >
                    Registrar
                </LoadingButton>
            </Stack>
        </Box>
    );
}

export default function ExportPage(props) {
    const location = useLocation();
    const [{
        nextKey,
        order,
        activateSearch,
        nextIteration,
    }, setStates] = useState({
        nextKey: null,
        order: 'desc',
        activateSearch: false,
        nextIteration: true,
    });
    const [items, setItems] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [modalState, setModalState] = useState(false);
    const [loading, setLoading] = useState(true);
    const {
        a,
        st,
        imei,
        fabrica,
        grupo,
        unidad,
        descripcion
    } = useMemo(() => QueryParse(location.search), []);

    const queryToSend = useMemo(() => (
        QueryStringify({
            a,
            st,
            imei,
            fabrica,
            fromDate: fromDate?.format('YYYY-MM-DD HH:mm:ss'),
            toDate: toDate?.format('YYYY-MM-DD HH:mm:ss'),
            order,
            $next: nextKey,
            $limit: 30
        }, {
            skipNull: true
        })
    ), [fromDate, toDate, order, nextKey]);

    useEffect(async () => {
        if(!activateSearch) return;
        const {data, next} = await fetchData(queryToSend);
        setItems(data);
        setStates({
            nextKey: next,
            order,
            nextIteration: false,
            activateSearch: false,
        });
        setLoading(false);
    }, [order, activateSearch]);

    useEffect(async () => {
        if(!nextIteration) return;
        const {data, next} = await fetchData(queryToSend);
        setItems([
            ...items,
            ...data
        ]);
        setStates({
            nextKey: next,
            order,
            activateSearch: false,
            nextIteration: false,
        });
        setLoading(false);
    }, [nextIteration]);

    // async function fetchData(query){
    //     const data = new Array(20).fill({
    //         creationTime: '2022-01-01 22:00:00',
    //         intervalStart: '2022-01-02 15:00:00',
    //         invervalEnd: '2022-01-02 17:00:00',
    //         status: 'progreso',
    //         url: '/aaa'
    //     });
    //     return {
    //         data,
    //         next: 'id'
    //     }
    // }
    
    async function fetchData(query){
        const {
            data: {
                links,
                payload
            }
        } = await getTickets(query);
        const nn = links.filter((element) => 'next' in element)[0]?.href;
        const next = nn ? QueryParse(nn).$next : null;
        return {
            data: payload.map((element) => ({
                creationTime: moment(element.fechaCreacion, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
                intervalStart: element.intervaloInicial,
                invervalEnd: element.intervaloFinal,
                status: element.estado,
                url: element.urlArchivo
            })),
            next
        }
    }

    function readyForSearch(){
        setStates({
            nextKey: null,
            order,
            nextIteration,
            activateSearch: true
        });
        setLoading(true);
    }

    function readyForNextIteration(){
        setStates({
            nextKey,
            order,
            activateSearch,
            nextIteration: true
        });
        setLoading(true);
    }

    function changeOrder(){
        setStates({
            nextKey: null,
            order: order === 'desc' ? 'asc' : 'desc',
            nextIteration,
            activateSearch: true
        });
        setLoading(true);
    }

    return (
        <>
            <Box sx={{width: '100%', px: 2}}>
                <Modal
                    open={modalState}
                    onClose={() => {
                        setModalState(false);
                    }}
                    sx={{
                        border: 0,
                        outline: 0
                    }}
                    >
                    <NewReport 
                        device={{
                            a,
                            st,
                            imei,
                            fabrica
                        }}
                        afterSave={() => {
                            setModalState(false);
                            readyForSearch();
                        }}/>
                </Modal>
                <Stack spacing={4}>
                    <Stack spacing={0}>
                        <Box sx={{display: 'flex', flexFlow: 'row', justifyContent: 'space-between'}}>
                            <Typography variant="h4">Exportar datos</Typography>
                            <Button
                            style={{ margin: '0 10px 20px 0' }}
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setModalState(true)
                            }}
                            >
                            Crear reporte
                            </Button>
                        </Box>
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle2">Codigo:</Typography>
                                <Typography variant="caption">{`${imei}#${a}#${st}#${fabrica}`}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle2">Descripcion:</Typography>
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
                    <Stack spacing={1}>
                        <Stack spacing={1} direction="row" alignItems="center">
                            <Typography variant="subtitle1">Historial de reportes</Typography>
                            <ReplayIcon
                                fontSize="small"
                                onClick={readyForSearch}
                                sx={{
                                    cursor: 'pointer'
                                }}
                            />
                        </Stack>
                        <InfiniteScroll
                            dataLength={items.length}
                            next={readyForNextIteration}
                            hasMore={!!nextKey}
                            scrollableTarget={window}
                            scrollThreshold={.9}
                        >
                        <TableContainer sx={{
                            position: 'relative'
                        }}>
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
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Box 
                                        onClick={changeOrder}
                                        sx={{
                                            cursor: 'pointer',
                                        }}>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >
                                                <Box>Fecha de creaci&oacute;n</Box>
                                                {
                                                    order === 'desc' ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                }
                                            </Stack>
                                        </Box>
                                    </TableCell>
                                    <TableCell>Intervalo</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.map((row, i) => (
                                        <TableRow
                                            key={i}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                        <TableCell component="th" scope="row">
                                            {row.creationTime}
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <div>{row.intervalStart}</div>
                                                <Box sx={{fontSize: (theme) => theme.typography.h4.fontSize}}>&rarr;</Box>
                                                <div>{row.invervalEnd}</div>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Label
                                                variant="ghost"
                                                color={row.status === 'progreso' ? 'warning' : 'success'}
                                            >{row.status === 'progreso' ? 'En Progreso' : 'Finalizado'}</Label>
                                        </TableCell>
                                        <TableCell>
                                            {
                                                row.url ? (
                                                    <a target="_blank" href={row.url}>
                                                        <Box 
                                                            sx={{
                                                            textDecoration: 'underline',
                                                            color: 'secondary.main',
                                                            cursor: 'pointer'
                                                        }}>
                                                        Descargar
                                                        </Box>
                                                    </a>
                                                ) : null
                                            }
                                        </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            </TableContainer>
                            </InfiniteScroll>
                        </Stack>
                </Stack>
            </Box>
        </>
    );
}

