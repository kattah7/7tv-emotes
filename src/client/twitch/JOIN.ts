import { client } from '../../utility/connections';
import { Emote } from '../../utility/db';
import { UserInfo } from '../../utility/parseUID';
import { getEmotes } from '../../utility/rest';
import fs from 'fs/promises';
import * as Logger from '../../utility/logger';

async function JOIN() {
    client.on('JOIN', async ({ channelName }) => {
        Logger.info(`Joined ${channelName}`);
        const { id } = (await UserInfo(channelName))[0];

        const emoteUsage = (await Emote.findOne({ id: id })).emotes.filter((emote) => isNaN(emote.usage));
        if (emoteUsage[0]) {
            for (const emote of emoteUsage) {
                await Emote.updateOne(
                    { 'id': id, 'emotes.emote': emote.emote },
                    { $set: { 'emotes.$.usage': 0 } }
                ).exec();
                Logger.info(`Reset usage for ${emote.emote} in ${channelName}`);
            }
        }

        async function emoteInfo(boolean: boolean, type: any, doFilter: boolean) {
            const emotes = new Set(
                (await Emote.findOne({ id: id })).emotes
                    .filter((emote) => (doFilter ? emote.isEmote === boolean : emote))
                    .map((emote) => emote[type])
            );
            return emotes;
        }

        await fs.writeFile(`./src/stats/${id}.json`, JSON.stringify([...(await emoteInfo(true, 'name', true))]));

        const filteredEmotes = await emoteInfo(true, 'emote', false);
        const deletedEmotesQuery = await emoteInfo(false, 'emote', true);

        const { emote_set } = await getEmotes(id);
        if (!emote_set.emotes) return;

        let emotes = [];
        let deletedEmotes = [];
        for (const emote of emote_set.emotes) {
            if (!filteredEmotes.has(emote.id)) {
                emotes.push(emote);
            } else {
                if (emote.name !== emote.data.name) {
                    await Emote.updateOne(
                        { 'id': id, 'emotes.emote': emote.id },
                        { $set: { 'emotes.$.name': emote.name } }
                    ).exec();
                }

                deletedEmotes.push(emote);
                if (deletedEmotesQuery.has(emote.id)) {
                    await Emote.updateOne(
                        { 'id': id, 'emotes.emote': emote.id },
                        { $set: { 'emotes.$.isEmote': true, 'emotes.$.name': emote.name } }
                    ).exec();
                    Logger.info(`Set ${emote.name} back to true in ${channelName}`);
                }
            }
        }

        const filterEmotes = [...filteredEmotes].filter(
            (emote) => !deletedEmotes.map((emote) => emote.id).includes(emote)
        );
        const emotesByIDAndTrue = await emoteInfo(true, 'emote', true);

        if (filterEmotes.length > 0) {
            for (const emote of filterEmotes) {
                if (emotesByIDAndTrue.has(emote)) {
                    await Emote.updateOne(
                        { 'id': id, 'emotes.emote': emote },
                        { $set: { 'emotes.$.isEmote': false, 'emotes.$.name': `Emote Removed` } }
                    ).exec();
                    Logger.info(`Set ${emote} to false in ${channelName}`);
                }
            }
        }

        for (const { name, id: emoteID } of emotes) {
            await Emote.updateOne(
                { id: id },
                { $push: { emotes: { name: name, emote: emoteID, usage: 1, isEmote: true, Date: Date.now() } } }
            ).exec();
            Logger.info(`Added ${name} to ${channelName}`);
        }

        // const duplicateNames = await Emote.findOne({ id: id }).then((emote: any) => {
        //     const names = emote.emotes.map((emote: any) => emote.name);
        //     // return the id of the emote that has a duplicate name
        //     return names
        //         .filter((name: any, index: any) => names.indexOf(name) !== index)
        //         .map((name: any) => emote.emotes.find((emote: any) => emote.name === name).emote);
        // });

        // for (const emote of duplicateNames) {
        //     const findThatSpecificEmote = (await Emote.findOne({ id: id })).emotes.find(
        //         (emote2) => emote2.emote === emote
        //     );

        //     const findThatEmote = (await Emote.findOne({ id: id })).emotes.filter(
        //         (emote2) => emote2.isEmote === true && emote2.name === findThatSpecificEmote?.name
        //     );

        //     await Emote.updateOne(
        //         { 'id': id, 'emotes.emote': findThatEmote[0].emote },
        //         { $set: { 'emotes.$.usage': findThatEmote[0].usage + findThatSpecificEmote.usage } }
        //     ).exec();

        //     await Emote.updateOne({ id: id }, { $pull: { emotes: { emote: findThatSpecificEmote?.emote } } }).exec();
        //     Logger.info(`Combined usage for ${emote} in ${channelName}`);

        //     // merge the emotes
        // }

        const emoteNames = await emoteInfo(true, 'name', true);
        await fs.writeFile(`./src/stats/${id}.json`, JSON.stringify([...emoteNames]));
        // for (const emote of emote_set.emotes) {
        //     const emoteDB = await Emote.findOne({ id: id }).exec();
        //     const emoteIDS = emoteDB?.emotes.map((emote) => emote.emote);
        //     Logger.info(`querying ${emote.name} in ${channelName}`);
        //     if (emoteDB && emoteIDS?.includes(emote.id)) continue;
        //     await Emote.findOneAndUpdate(
        //         { id: id },
        //         {
        //             $push: {
        //                 emotes: {
        //                     name: emote.name,
        //                     emote: emote.id,
        //                     usage: 1,
        //                     isEmote: true,
        //                     Date: Date.now(),
        //                 },
        //             },
        //         },
        //         { upsert: true, new: true }
        //     ).exec();
        //     const existtingEmoteNames = new Set(
        //         (await Emote.findOne({ id: id })).emotes
        //             .filter((emote) => emote.isEmote === true)
        //             .map((emote) => emote.name)
        //     );
        //     await fs.writeFile(`./src/stats/${id}.json`, JSON.stringify([...existtingEmoteNames]));
        //     Logger.info(`Added ${emote.name} to ${channelName}'s emotes`);
        // }
    });
}

export { JOIN };
