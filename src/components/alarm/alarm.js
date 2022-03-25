import './calendar.css';
import { makeStyles } from "@material-ui/styles";
import Calendar from 'react-calendar';
import moment from 'moment';
import { 
    Stack,
    Paper,
    Typography,
    Tooltip
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
                        const ff = select.some((element) => element === moment(date).format('YYYY-MM-DD'));
                        return ff ? classes.inAlert : null;
                    }}
                    onClickDay={(value) => {
                        onSelected(moment(value).format('YYYY-MM-DD'));
                    }}
                    tileDisabled={({ date }) => {
                        return !select.some((element) => element === moment(date).format('YYYY-MM-DD'));
                    }}
                />
            </Stack>
        </Paper>
    );
}