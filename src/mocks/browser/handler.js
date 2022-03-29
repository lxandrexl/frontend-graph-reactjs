import { setupWorker, rest } from 'msw'
import { parse as QueryParse, stringify } from 'query-string';

// 2. Define request handlers and response resolvers.
export const worker = setupWorker(
  rest.get(`${process.env.REACT_APP_API_BASEURL}/alarms`, (req, res, ctx) => {
    const {
      url
    } = req;
    const {action} = QueryParse(url.search);
    switch(action){
      case 'by_year':
        return res(
          ctx.status(200),
          ctx.json({
            payload: [{
              year: 2022,
              month: 3,
              day: 20,
              total: 10
            }]
          }),
        )
      case 'by_day':
        return res(
          ctx.status(200),
          ctx.json({
            payload: [{
              year: 2022,
              month: 3,
              day: 20,
              hour: 15,
              total: 10
            }]
          }),
        )
      case 'by_hour':
        return res(
          ctx.status(200),
          ctx.json({
            payload: [
              '2022-03-20 15:00:00',
              '2022-03-20 15:01:00',
              '2022-03-20 15:02:00'
            ]
          }),
        )
    }
  }),
)