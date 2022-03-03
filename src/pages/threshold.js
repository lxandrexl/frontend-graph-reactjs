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
    Alert,
    Drawer
} from '@material-ui/core';
import LoadingButton from '@material-ui/lab/LoadingButton';
import SaveIcon from '@material-ui/icons/Save';
import InfoIcon from '@material-ui/icons/Info';
import { yupResolver } from '@hookform/resolvers/yup';
import {SearchStyle} from '../components/_dashboard/user/UserListToolbar'
import {getThreshold, saveThreshold} from '../services/threshold.service';
import { useForm, Controller } from "react-hook-form";
import * as yup from 'yup';

function capitalize(word) {
    const lower = word.toLowerCase();
    return word.charAt(0).toUpperCase() + lower.slice(1);
}

function FormInput(props){

    const {
        label,
        orientation = 'column',
        component,
        align = 'start',
        enableInfo = true,
        onClick
    } = props;

    return (
        <Stack spacing={2} direction={orientation} alignItems={align}>
            <Box sx={{
                paddingRight: 5,
                boxSizing: 'border-box',
                overflowWrap: 'break-word'
            }}>
                <Stack direction='row' spacing={1}>
                    {
                       enableInfo ? <InfoIcon sx={{cursor: 'pointer'}} onClick={onClick} /> : null
                    }
                    <Typography sx={{
                        overflowWrap: 'break-word'
                    }} align="left" variant="body2">{label}</Typography>
                </Stack>
            </Box>
            {component}
        </Stack>
    );

}

const schema = yup
    .object()
    .shape({
        umbralMinimo: yup.number().typeError('Solo valores numéricos').required(),
        umbralMaximo: yup.number().typeError('Solo valores numéricos').required(),
        tiempoUmbralMinimo: yup.number().typeError('Solo valores numéricos').moreThan(0, "Debe ser mayor a 0").required(),
        tiempoUmbralMaximo: yup.number().typeError('Solo valores numéricos').moreThan(0, "Debe ser mayor a 0").required(),
        frecuenciaNotificacionesUmbralMinimo: yup.number().typeError('Solo valores numéricos').moreThan(0, "Debe ser mayor a 0").required(),
        frecuenciaNotificacionesUmbralMaximo: yup.number().typeError('Solo valores numéricos').moreThan(0, "Debe ser mayor a 0").required(),
        cantidadMaximaNotificaciones: yup.number().typeError('Solo valores numéricos').moreThan(0, "Debe ser mayor a 0").required(),
        activoUmbralMinimo: yup.boolean().required(),
        activoUmbralMaximo: yup.boolean().required()
    }).required();

const UmbralInfo = () => {
    return (
        <>
            <Typography variant="h4">Umbrales</Typography>
            <Typography variant="body1">
                Para poder detectar algun suceso importante en los dispositivos se hace uso de los <b>Umbrales</b>,
                esto va a permitir poder limitar un rango de valores que pueden ser considerados de alerta.
            </Typography>
            <Stack spacing={.5}>
                <Typography variant="subtitle1">Umbral minimo</Typography>
                <Typography variant="body2">
                    Es un valor mínimo del sensor que define un límite que inicia un seguimiento a los valores del sensor que notificará al usuario. 
                </Typography>
            </Stack>
            <Stack spacing={.5}>
                <Typography variant="subtitle1">Umbral maximo</Typography>
                <Typography variant="body2">
                    Es un valor maximo del sensor que define un límite que inicia un seguimiento a los valores del sensor que notificará al usuario. 
                </Typography>
            </Stack>
        </>
    );
}

const TimeInfo = () => {
    return (
        <>
            <Typography variant="h4">Tiempo</Typography>
            <Typography variant="body1">
                Para la activacion de un umbral y su posterior notificacion es necesario configurar el <b>tiempo</b>,
                este valor va a permitir que cuando se detecte que el umbral ha pasado su maximo o minimo segun sea el caso
                pase a un estado de <b>observacion</b> permitiendo que los segundos configurados en <b>frecuencia</b> se tome en cuenta.
            </Typography>
            <Stack spacing={.5}>
                <Typography variant="subtitle1">Tiempo umbral minimo</Typography>
                <Typography variant="body2">
                    La cantidad de segundos en el cual el valor del sensor debe estar por debajo del umbral minimo.
                </Typography>
            </Stack>
            <Stack spacing={.5}>
                <Typography variant="subtitle1">Tiempo umbral maximo</Typography>
                <Typography variant="body2">
                    La cantidad de segundos en el cual el valor del sensor debe estar por debajo del umbral maximo.
                </Typography>
            </Stack>
        </>
    );
}

const FrequencyInfo = () => {
    return (
        <>
            <Typography variant="h4">Frecuencia</Typography>
            <Typography variant="body1">
                Cuando el valor del sensor ha pasado los umbrales definidos y asi mismo con el tiempo establecido, entra en accion la <b>frecuencia</b> en la cual va a permitir el envio de notificaciones en el intervalo configurado.  
            </Typography>
            <Stack spacing={.5}>
                <Typography variant="subtitle1">Frecuencia umbral minimo</Typography>
                <Typography variant="body2">
                    La cantidad de segundos en el cual se enviara notificaciones para la configuracion del umbral minimo.
                </Typography>
            </Stack>
            <Stack spacing={.5}>
                <Typography variant="subtitle1">Frecuencia umbral maximo</Typography>
                <Typography variant="body2">
                    La cantidad de segundos en el cual se enviara notificaciones para la configuracion del umbral maximo.
                </Typography>
            </Stack>
        </>
    );
}

const MaxNotificationsInfo = () => {
    return (
        <>
            <Typography variant="h4">Cantidad de notificaciones</Typography>
            <Typography variant="body1">
                Esta configuracion va a permitir que cuando el valor del sensor haya superado el umbral minimo o maximo y este dentro del rango establecido
                de tiempo y frecuencia, se limite el numero de notificaciones a enviar.
            </Typography>
            <Stack spacing={.5}>
                <Typography variant="subtitle1">Ejemplo</Typography>
                <Typography variant="body2">
                    Tenemos un sensor de temperatura cuyo umbral maximo es: 30 grados celsius, el tiempo es: 30 segundos y la frecuencia: 10 segundos,
                    durante un periodo de tiempo el sensor envia 35 grados celsius por mas de 30 segundos y con una frecuencia de 10 segundos y esto se prolonga
                    por alrededor de 5 minutos, con esta configuracion podremos limitar la cantidad de notificaciones para que no se tenga un conjunto de mensajes
                    repetidos, para este ejemplo se configuro con el valor de 5, es decir que dentro de esos 5 minutos que tenemos con el valor del sensor superando
                    el maximo del umbral configurado tendriamos como maximo 5 notificaciones.
                </Typography>
            </Stack>
        </>
    );
}

export default function ThresholdPage(props) {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [snackBar, setSnackBar] = useState(false);
    const [snackBarStatus, setSnackBarStatus] = useState('success');
    const [infoTrigger, setInfoTrigger] = useState(false);
    const [infoKind, setInfoKind] = useState('umbral');
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
            <Drawer
                anchor={'right'}
                open={infoTrigger}
                onClose={() => {
                    setInfoTrigger(false);
                }}
            >
                <Stack
                    spacing={2}
                    sx={{
                        p: 4,
                        width: {
                            xs: 300,
                            sm: 400
                        }
                    }}
                >
                    {
                        (() => {
                            switch(infoKind){
                                case 'umbral':
                                    return (<UmbralInfo/>);
                                case 'time':
                                    return (<TimeInfo/>);
                                case 'frequency':
                                    return (<FrequencyInfo/>);
                                case 'maxnotis':
                                    return (<MaxNotificationsInfo/>);
                            }
                        })()
                    }
                </Stack>
            </Drawer>
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
                                <Typography variant="h6">Configuración</Typography>
                                <Stack spacing={4}>
                                    <FormInput
                                        label='Activar'
                                        enableInfo={false}
                                        component={
                                            <Stack direction='row' spacing={5}>
                                                <Stack direction='column' spacing={1}>
                                                    <Typography variant="caption">Umbral Minimo</Typography>
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
                                                <Stack direction='column' spacing={1}>
                                                    <Typography variant="caption">Umbral Maximo</Typography>
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
                                        label={`Umbral (${capitalize(unidad)})`}
                                        onClick={() => {
                                            setInfoTrigger(true);
                                            setInfoKind('umbral');
                                        }}
                                        component={
                                            <Stack direction='row' spacing={3}>
                                                <Stack direction='column' spacing={1}>
                                                    <Typography variant="caption">Umbral Minimo</Typography>
                                                    <Controller
                                                        name="umbralMinimo"
                                                        control={control}
                                                        render={({ field: { ref, ...rest } }) => (
                                                            <SearchStyle 
                                                                {...rest}
                                                                inputRef={ref}
                                                                sx={{
                                                                maxWidth: {
                                                                    xs: 100,
                                                                    sm: 130
                                                                },
                                                                '&.Mui-focused': { maxWidth: {
                                                                    xs: 100,
                                                                    sm: 130
                                                                }},
                                                            }}/>
                                                        )
                                                        }
                                                    />
                                                    <Typography
                                                        sx={{
                                                            maxWidth: 100,
                                                            overflowWrap: 'break-word'
                                                        }}
                                                        color="error"
                                                        variant="caption"
                                                    >
                                                        {errors?.umbralMinimo?.message}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction='column' spacing={1}>
                                                    <Typography variant="caption">Umbral Maximo</Typography>
                                                    <Controller
                                                        name="umbralMaximo"
                                                        control={control}
                                                        render={({ field }) => <SearchStyle 
                                                                {...field}
                                                                sx={{
                                                                maxWidth: {
                                                                    xs: 100,
                                                                    sm: 130
                                                                },
                                                                '&.Mui-focused': { maxWidth: {
                                                                    xs: 100,
                                                                    sm: 130
                                                                } },
                                                            }}/>
                                                        }
                                                    />
                                                    <Typography
                                                        sx={{
                                                            maxWidth: 100,
                                                            overflowWrap: 'break-word'
                                                        }}
                                                        color="error"
                                                        variant="caption"
                                                    >
                                                        {errors?.umbralMaximo?.message}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        }
                                    ></FormInput>
                                    <FormInput
                                        label='Tiempo (Segundos)'
                                        onClick={() => {
                                            setInfoTrigger(true);
                                            setInfoKind('time');
                                        }}
                                        component={
                                            <Stack direction='row' spacing={3}>
                                                <Stack direction='column' spacing={1}>
                                                    <Typography variant="caption">Umbral Minimo</Typography>
                                                    <Controller
                                                        name="tiempoUmbralMinimo"
                                                        control={control}
                                                        render={({ field }) => <SearchStyle 
                                                                {...field}
                                                                sx={{
                                                                maxWidth: {
                                                                    xs: 100,
                                                                    sm: 130
                                                                },
                                                                '&.Mui-focused': { maxWidth: {
                                                                    xs: 100,
                                                                    sm: 130
                                                                } },
                                                            }}/>
                                                        }
                                                    />
                                                    <Typography
                                                        sx={{
                                                            maxWidth: {
                                                                xs: 100,
                                                                sm: 130
                                                            },
                                                            overflowWrap: 'break-word'
                                                        }}
                                                        color="error"
                                                        variant="caption"
                                                    >
                                                        {errors?.tiempoUmbralMinimo?.message}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction='column' spacing={1}>
                                                    <Typography variant="caption">Umbral Maximo</Typography>
                                                    <Controller
                                                        name="tiempoUmbralMaximo"
                                                        control={control}
                                                        render={({ field }) => <SearchStyle 
                                                                {...field}
                                                                sx={{
                                                                maxWidth: {
                                                                    xs: 100,
                                                                    sm: 130
                                                                },
                                                                '&.Mui-focused': { maxWidth: {
                                                                    xs: 100,
                                                                    sm: 130
                                                                } },
                                                            }}/>
                                                        }
                                                    />
                                                    <Typography
                                                        sx={{
                                                            maxWidth: {
                                                                xs: 100,
                                                                sm: 130
                                                            },
                                                            overflowWrap: 'break-word'
                                                        }}
                                                        color="error"
                                                        variant="caption"
                                                    >
                                                        {errors?.tiempoUmbralMaximo?.message}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        }
                                    ></FormInput>
                                    <FormInput
                                        label='Frecuencia (Segundos)'
                                        onClick={() => {
                                            setInfoTrigger(true);
                                            setInfoKind('frequency');
                                        }}
                                        component={
                                            <Stack direction='row' spacing={3}>
                                                <Stack direction='column' spacing={1}>
                                                    <Typography variant="caption">Umbral Minimo</Typography>
                                                    <Controller
                                                        name="frecuenciaNotificacionesUmbralMinimo"
                                                        control={control}
                                                        render={({ field }) => <SearchStyle 
                                                                {...field}
                                                                sx={{
                                                                maxWidth: {
                                                                    xs: 100,
                                                                    sm: 130
                                                                },
                                                                '&.Mui-focused': { maxWidth: {
                                                                    xs: 100,
                                                                    sm: 130
                                                                } },
                                                            }}/>
                                                        }
                                                    />
                                                    <Typography
                                                        sx={{
                                                            maxWidth: {
                                                                xs: 100,
                                                                sm: 130
                                                            },
                                                            overflowWrap: 'break-word'
                                                        }}
                                                        color="error"
                                                        variant="caption"
                                                    >
                                                        {errors?.frecuenciaNotificacionesUmbralMinimo?.message}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction='column' spacing={1}>
                                                    <Typography variant="caption">Umbral Maximo</Typography>
                                                    <Controller
                                                        name="frecuenciaNotificacionesUmbralMaximo"
                                                        control={control}
                                                        render={({ field }) => <SearchStyle 
                                                                {...field}
                                                                sx={{
                                                                maxWidth: {
                                                                    xs: 100,
                                                                    sm: 130
                                                                },
                                                                '&.Mui-focused': { maxWidth: {
                                                                    xs: 100,
                                                                    sm: 130
                                                                } },
                                                            }}/>
                                                        }
                                                    />
                                                    <Typography
                                                        sx={{
                                                            maxWidth: {
                                                                xs: 100,
                                                                sm: 130
                                                            },
                                                            overflowWrap: 'break-word'
                                                        }}
                                                        color="error"
                                                        variant="caption"
                                                    >
                                                        {errors?.frecuenciaNotificacionesUmbralMaximo?.message}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        }
                                    ></FormInput>
                                    <FormInput
                                        label='Max. Notificaciones (Cantidad)'
                                        onClick={() => {
                                            setInfoTrigger(true);
                                            setInfoKind('maxnotis');
                                        }}
                                        component={
                                            <Stack direction='column' spacing={1}>
                                                <Controller
                                                    name="cantidadMaximaNotificaciones"
                                                    control={control}
                                                    render={({ field }) => <SearchStyle 
                                                            {...field}
                                                            sx={{
                                                            maxWidth: {
                                                                xs: 100,
                                                                sm: 130
                                                            },
                                                            '&.Mui-focused': { maxWidth: {
                                                                xs: 100,
                                                                sm: 130
                                                            } },
                                                        }}/>
                                                    }
                                                />
                                                <Typography
                                                    sx={{
                                                        maxWidth: {
                                                            xs: 100,
                                                            sm: 130
                                                        },
                                                        overflowWrap: 'break-word'
                                                    }}
                                                    color="error"
                                                    variant="caption"
                                                >
                                                    {errors?.cantidadMaximaNotificaciones?.message}
                                                </Typography>
                                            </Stack>
                                        }
                                    ></FormInput>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>
                </Stack>
            </Box>
        </>
    );
}