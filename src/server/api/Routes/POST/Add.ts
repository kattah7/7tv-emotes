import Express from 'express';
import { ChannelHandler } from '../../../handler/ChannelHandler';

const Router = Express.Router();

Router.post('/add/:username', async (req, res) => {
  const token = req.header('Authorization');

  if (token === `Bearer ${Bot.Config.API.authKey}`) {
    const username = req.params.username;

    try {
      await ChannelHandler(username);

      res.json({ message: `The channel "${username}" has been successfully added.` });
    } catch (error) {
      res.status(500).json({ error: true, message: `An error occurred while adding the channel: ${error}` });
    }
  } else {
    res.status(401).json({ error: true, message: 'The authentication token is invalid.' });
  }
});

export default Router;
