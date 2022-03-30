import './calendar.css';
import { useMemo, useState } from 'react';
import { makeStyles } from "@material-ui/styles";
import Calendar from 'react-calendar';
import moment from 'moment';
import { 
    Stack,
    Paper,
    Typography,
    Box,
    Button,
    Tooltip,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%'
    },
    inAlert: {
        backgroundColor: 'red !important',
        color: 'white'
    }
}));

export function AlarmHours({
    fecha,
    hourAlerts,
    listDates,
    onSelect
}){

    const maxAlarmsHour = useMemo(() => {
        return (hourAlerts || []).reduce((prev, actual) => {
            const [total] = prev;
            if(actual.total > total){
                prev[0] = actual.total;
                prev[1] = `${(actual.hour).toString().padStart(2, '0')}:00`;
            }
            return prev;
        }, [0, '00:00'])
    }, [hourAlerts]);

    return (
        <Stack spacing={3}>
            <Stack spacing={1}>
                <Typography variant="subtitle1">{moment(fecha).format('dddd DD [de] MMMM [del] YYYY')}</Typography>
                <Typography variant="body2">Hora con mayor cantidad de alarmas: {maxAlarmsHour[1]}</Typography>
            </Stack>
            <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
            }}>
                {
                    (listDates || []).map((element) => {
                        const getH = element.x.substring(0, 2);
                        const [found] = hourAlerts.filter((element) => {
                            return element.hour === +getH;
                        });
                        const title = found ? `Cantidad de alarmas: ${found.total}` : '';
                        return (
                            <Box sx={{
                                flex: '1 1 15.00%',
                                boxShadow: 'border-box',
                                p: 1
                            }}>
                                <Tooltip title={title}>
                                <Button 
                                    variant="outlined"
                                    disabled={!found}
                                    sx={{
                                        width: '100%'
                                    }}
                                    color="error"
                                    onClick={() => {
                                        onSelect(`${fecha} ${getH}`);
                                    }}
                                >{element.x}</Button>
                                </Tooltip>  
                            </Box>
                        );
                    })
                }
            </Box>
        </Stack>
    );
}

export function AlarmCalendar({
    select,
    date,
    onSelected
}){
    const dateInput = moment(date, 'YYYY-MM-DD');
    const classes = useStyles();
    return (
        <Paper square elevation={5} sx={{ p: 2 }}>
            <Stack spacing={3}>
                <Typography variant="subtitle1">{dateInput.format('MMMM')} {dateInput.year()}</Typography>
                <Calendar
                    className={classes.root}
                    locale='es'
                    showNeighboringMonth={false}
                    showNavigation={false}
                    activeStartDate={dateInput.toDate()}
                    tileClassName={({ date }) => {
                        const dd = moment(date).format('YYYY-MM-DD');
                        const ff = select.some((element) => {
                            const {year, month, day} = element;
                            const d = moment(new Date(year, month - 1, day)).format('YYYY-MM-DD');
                            return d === dd
                        });
                        return ff ? classes.inAlert : null;
                    }}
                    onClickDay={(value) => {
                        onSelected(moment(value).format('YYYY-MM-DD'));
                    }}
                    tileDisabled={({ date }) => {
                        const dd = moment(date).format('YYYY-MM-DD');
                        return !(select.some((element) => {
                            const {year, month, day} = element;
                            const d = moment(new Date(year, month - 1, day)).format('YYYY-MM-DD');
                            return d === dd
                        }));
                    }}
                />
            </Stack>
        </Paper>
    );
}