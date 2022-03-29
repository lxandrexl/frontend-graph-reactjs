import { setupWorker, rest } from 'msw'

// 2. Define request handlers and response resolvers.
export const worker = setupWorker(
  rest.get(process.env.REACT_APP_API_BASEURL, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Mocked response JSON body',
      }),
    )
  }),
)