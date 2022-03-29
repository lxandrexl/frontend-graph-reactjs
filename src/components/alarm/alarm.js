import './calendar.css';
import { useMemo, useState } from 'react';
import { makeStyles } from "@material-ui/styles";
import Calendar from 'react-calendar';
import moment from 'moment';
import { 
    Stack,
    Paper,
    Typography,
} from '@material-ui/core';
import Chart from 'react-apexcharts'

const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%'
    },
    inAlert: {
        backgroundColor: 'red !important',
        color: 'white'
    }
}));

export function AlarmChart({
    onClick
}){

    const [refresh, setRefresh] = useState(false);

    const listDates = useMemo(() => {
        const dates = [...Array(24).keys()]
            .map((element) => `${(element).toString().padStart(2, '0')}:00`);
        return (dates ?? []).map((element) => {
            return {
                x: element,
                y: Math.floor(Math.random() * (20 - 0) + 0).toFixed(0)
            }
        })
    }, [refresh]);

    return (
        <Chart options={{
            chart: {
                id: 'chart',
                events: {
                    click(event, chartContext, config) {
                        const ser = config.config.series[config.seriesIndex];
                        const pass = ser && ser.data;
                        if(pass){
                            const data = ser.data[config.dataPointIndex];
                            onClick(data);
                        }
                    },
                    dataPointMouseEnter: function(event) {
                        event.path[0].style.cursor = "pointer";
                    }              
                },
                zoom: {
                    enabled: true,
                    type: 'x',
                    resetIcon: {
                        offsetX: -10,
                        offsetY: 0,
                        fillColor: '#fff',
                        strokeColor: '#37474F'
                    },
                    selection: {
                        background: '#90CAF9',
                        border: '#0D47A1'
                    }    
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return `Alarmas: ${val}`
                    },
                    title: {
                        formatter: (seriesName) => '',
                    },
                },
                x: {
                    show: false
                },
                marker: {
                    show: false,
                },
            },
            colors: ['#F44336']
        }} 
        series={[{
            data: listDates
        }]}
        type="bar"
        width={2000}
        height={320} 
        />
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