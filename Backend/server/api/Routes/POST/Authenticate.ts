import Express from 'express';
const Router = Express.Router();

Router.post('/auth', async (req, res) => {
	res.send('Hello World!');
	console.log(req);
});

export default Router;
