import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { join } from 'path';
import fs from 'fs';

const App = express();
const commandsPath = new URL('./Routes', import.meta.url).pathname;

(async () => {
	for (const file of fs.readdirSync(commandsPath)) {
		const subFolder = join(commandsPath, file);
		const subFolderFiles = fs.readdirSync(subFolder);

		for (const subFile of subFolderFiles) {
			if (!subFile.endsWith('.js')) continue;
			const route = await import(`./Routes/${file}/${subFile}`);
			App.use(route.default);
		}
	}
})();

App.use(cors(), morgan('dev'));
App.listen(Bot.Config.API.port, () => {
	Bot.Logger.Log(`API listening on port ${Bot.Config.API.port}`);
});
