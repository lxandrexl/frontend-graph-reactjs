import { useEffect, useState, useMemo } from 'react';
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
import Calendar from 'react-calendar';

export function AlarmPage(){
    const location = useLocation();
    const {
        a,
        st,
        imei,
        fabrica,
        grupo,
        unidad,
        descripcion
    } = useMemo(() => QueryParse(location.search), []);
    return (
        <>
            <Box sx={{width: '100%', px: 2}}>
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Box sx={{display: 'flex', flexFlow: 'row', justifyContent: 'space-between'}}>
                            <Typography variant="h4">Umbrales</Typography>
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