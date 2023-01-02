import * as fs from 'fs';

export const podcastRoot = '/Users/fkimmel/Dropbox/Podcast/Aufnahmen';

export const readEpisodes = () => fs.promises.readdir(podcastRoot)
        .then(files => files.filter((file) => !file.startsWith(".")));
