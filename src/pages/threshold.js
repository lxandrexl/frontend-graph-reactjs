import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router';
import { parse as QueryParse } from 'query-string';
import { 
    Box,
    Typography,
    Stack,
    Backdrop,
    CircularProgress,
    alpha,
    Switch,
    Snackbar,
    Alert
} from '@material-ui/core';
import LoadingButton from '@material-ui/lab/LoadingButton';
import SaveIcon from '@material-ui/icons/Save';
import { yupResolver } from '@hookform/resolvers/yup';
import {SearchStyle} from '../components/_dashboard/user/UserListToolbar'
import {getThreshold, saveThreshold} from '../services/threshold.service';
import { useForm, Controller } from "react-hook-form";
import * as yup from 'yup';

function FormInput(props){

    const {
        label,
        orientation = 'row',
        component,
        align = 'center'
    } = props;

    return (
        <Stack direction={orientation} alignItems={align}>
            <Box sx={{
                width: {
                    xs: 120,
                    sm: 170
                },
                overflowWrap: 'break-word'
            }}>
                <Typography sx={{
                    overflowWrap: 'break-word'
                }} align="left" variant="body2">{label}</Typography>
            </Box>
            {component}
        </Stack>
    );

}

const schema = yup
    .object()
    .shape({
        umbralMinimo: yup.number().moreThan(-1).required(),
        umbralMaximo: yup.number().moreThan(-1).required(),
        tiempoUmbralMinimo: yup.number().moreThan(-1).required(),
        tiempoUmbralMaximo: yup.number().moreThan(-1).required(),
        frecuenciaNotificacionesUmbralMinimo: yup.number().moreThan(-1).required(),
        frecuenciaNotificacionesUmbralMaximo: yup.number().moreThan(-1).required(),
        cantidadMaximaNotificaciones: yup.number().moreThan(-1).required(),
        activoUmbralMinimo: yup.boolean().required(),
        activoUmbralMaximo: yup.boolean().required()
    }).required();

export default function ThresholdPage(props) {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [snackBar, setSnackBar] = useState(false);
    const [snackBarStatus, setSnackBarStatus] = useState('success');
    const {
        a,
        st,
        imei,
        fabrica,
        grupo,
        unidad,
        descripcion
    } = useMemo(() => QueryParse(location.search), []);
    const { 
        control, 
        getValues,
        setValue,
        trigger,
        watch,
        formState: { errors, isDirty, isValid }, 
    } = useForm({
        defaultValues: {
            umbralMinimo: '',
            umbralMaximo: '',
            tiempoUmbralMinimo: '',
            tiempoUmbralMaximo: '',
            frecuenciaNotificacionesUmbralMinimo: '',
            frecuenciaNotificacionesUmbralMaximo: '',
            cantidadMaximaNotificaciones: '',
            activoUmbralMinimo: false,
            activoUmbralMaximo: false
        },
        resolver: yupResolver(schema)
    });
    const {
        activoUmbralMaximo,
        activoUmbralMinimo
    } = getValues();
    
    async function fetchData(_imei, _fabrica, _a, _st){
        const {
            data: {
                payload
            }
        } = await getThreshold(_imei);
        const [result] = payload.filter((item) => {
            return (
                item?.fabrica === _fabrica &&
                item?.a == _a &&
                item?.st === _st
            );
        });
        const {
            a,
            st,
            fabrica,
            ...rest
        } = result;
        Object.entries(rest).forEach(([key, value]) => {
            const v = value ?? (key === 'activoUmbralMinimo' || key === 'activoUmbralMaximo' ? false : 0)
            setValue(key, v);
        });
    };

    async function loadData(_imei, _fabrica, _a, _st){
        try{
            setLoading(true);
            await fetchData(_imei, _fabrica, _a, _st);
        }catch(e){
            console.error(e);
            setSnackBar(true);
            setSnackBarStatus('error');
        }finally{
            setLoading(false);
        }
    }

    async function saveData(body){
        try{
            setLoadingSave(true);
            await saveThreshold(body);
            setSnackBar(true);
            setSnackBarStatus('success');
        }catch(e){
            console.error(e);
            setSnackBar(true);
            setSnackBarStatus('error');
        }finally{
            setLoadingSave(false);
        }
    }

    useEffect(() => {
        const subscription = watch(async (value, { name, type }) => {
            await trigger(name);
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    useEffect(async () => {
        loadData(imei, fabrica, a, st);
    }, [fabrica]);

    return (
        <>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={snackBar} 
                autoHideDuration={3000} 
                onClose={() => {
                    setSnackBar(false);
                }}
            >
                <Alert 
                    onClose={() => {
                        setSnackBar(false);
                    }} 
                    severity={snackBarStatus}
                    sx={{ width: '100%' }}
                >
                    {
                        snackBarStatus === 'success' ? 'Cambios guardados' : 'Intentalo nuevamente'
                    }
                </Alert>
            </Snackbar>
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
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <LoadingButton
                                loading={loadingSave}
                                style={{ margin: '0 10px 20px 0' }}
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon />}
                                disabled={!(isDirty && isValid)}
                                onClick={() => {
                                    const values = getValues();
                                    const cValues = Object.entries(values).reduce((a,[k,v]) => ((a[k]=typeof v === 'string' ? +v : v, a)), {})
                                    const part = {
                                        a: +a,
                                        st,
                                        imei,
                                        fabrica,
                                        ...cValues
                                    };
                                    const toSend = Object.entries(part).reduce((a,[k,v]) => (v !== '' ? (a[k]=v, a) : a), {})
                                    saveData(toSend);
                                }}
                            >Guardar Cambios</LoadingButton>
                        </Box>
                    </Stack>
                    <Stack spacing={0}>
                        <Box
                            sx={{
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
                            <Stack spacing={3}>
                                <Typography variant="h6">Configuracion</Typography>
                                <Stack spacing={3}>
                                    <FormInput
                                        label='Activar'
                                        component={
                                            <Stack direction='row' spacing={7}>
                                                <Stack direction='column'>
                                                    <Typography variant="caption">Minimo</Typography>
                                                    <Controller
                                                        name="activoUmbralMinimo"
                                                        control={control}
                                                        render={({ field: { onChange, onBlur, value, name, ref } }) => (
                                                            <Switch 
                                                                onChange={onChange}
                                                                inputRef={ref}
                                                                checked={!!activoUmbralMinimo} />
                                                        )}
                                                    />
                                                </Stack>
                                                <Stack direction='column'>
                                                    <Typography variant="caption">Maximo</Typography>
                                                    <Controller
                                                        name="activoUmbralMaximo"
                                                        control={control}
                                                        render={({ field }) =>  <Switch {...field} checked={!!activoUmbralMaximo} />
                                                        }
                                                    />
                                                </Stack>
                                            </Stack>
                                        }
                                    ></FormInput>
                                    <FormInput
                                        label='Umbral'
                                        component={
                                            <Stack direction='row' spacing={2}>
                                                <Stack direction='column'>
                                                    <Typography variant="caption">Minimo</Typography>
                                                    <Controller
                                                        name="umbralMinimo"
                                                        control={control}
                                                        render={({ field: { ref, ...rest } }) => (
                                                            <SearchStyle 
                                                                {...rest}
                                                                inputRef={ref}
                                                                sx={{
                                                                maxWidth: 100,
                                                                '&.Mui-focused': { maxWidth: 100 },
                                                            }}/>
                                                        )
                                                        }
                                                    />
                                                    <Typography variant="caption">
                                                        {errors?.umbralMinimo?.message}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction='column'>
                                                    <Typography variant="caption">Maximo</Typography>
                                                    <Controller
                                                        name="umbralMaximo"
                                                        control={control}
                                                        render={({ field }) => <SearchStyle 
                                                                {...field}
                                                                sx={{
                                                                maxWidth: 100,
                                                                '&.Mui-focused': { maxWidth: 100 },
                                                            }}/>
                                                        }
                                                    />
                                                </Stack>
                                            </Stack>
                                        }
                                    ></FormInput>
                                    <FormInput
                                        label='Tiempo'
                                        component={
                                            <Stack direction='row' spacing={2}>
                                                <Stack direction='column'>
                                                    <Typography variant="caption">Minimo</Typography>
                                                    <Controller
                                                        name="tiempoUmbralMinimo"
                                                        control={control}
                                                        render={({ field }) => <SearchStyle 
                                                                {...field}
                                                                sx={{
                                                                maxWidth: 100,
                                                                '&.Mui-focused': { maxWidth: 100 },
                                                            }}/>
                                                        }
                                                    />
                                                </Stack>
                                                <Stack direction='column'>
                                                    <Typography variant="caption">Maximo</Typography>
                                                    <Controller
                                                        name="tiempoUmbralMaximo"
                                                        control={control}
                                                        render={({ field }) => <SearchStyle 
                                                                {...field}
                                                                sx={{
                                                                maxWidth: 100,
                                                                '&.Mui-focused': { maxWidth: 100 },
                                                            }}/>
                                                        }
                                                    />
                                                </Stack>
                                            </Stack>
                                        }
                                    ></FormInput>
                                    <FormInput
                                        label='Frecuencia'
                                        component={
                                            <Stack direction='row' spacing={2}>
                                                <Stack direction='column'>
                                                    <Typography variant="caption">Minimo</Typography>
                                                    <Controller
                                                        name="frecuenciaNotificacionesUmbralMinimo"
                                                        control={control}
                                                        render={({ field }) => <SearchStyle 
                                                                {...field}
                                                                sx={{
                                                                maxWidth: 100,
                                                                '&.Mui-focused': { maxWidth: 100 },
                                                            }}/>
                                                        }
                                                    />
                                                </Stack>
                                                <Stack direction='column'>
                                                    <Typography variant="caption">Maximo</Typography>
                                                    <Controller
                                                        name="frecuenciaNotificacionesUmbralMaximo"
                                                        control={control}
                                                        render={({ field }) => <SearchStyle 
                                                                {...field}
                                                                sx={{
                                                                maxWidth: 100,
                                                                '&.Mui-focused': { maxWidth: 100 },
                                                            }}/>
                                                        }
                                                    />
                                                </Stack>
                                            </Stack>
                                        }
                                    ></FormInput>
                                    <Controller
                                        name="cantidadMaximaNotificaciones"
                                        control={control}
                                        render={({ field }) => <FormInput
                                                label='Max. Notificaciones'
                                                component={
                                                    <SearchStyle 
                                                        {...field}
                                                        sx={{
                                                        maxWidth: 100,
                                                        '&.Mui-focused': { maxWidth: 100 },
                                                    }}/>
                                                }
                                            ></FormInput> 
                                        }
                                    />
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>
                </Stack>
            </Box>
        </>
    );
}