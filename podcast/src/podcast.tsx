import {Action, ActionPanel, List} from "@raycast/api";
import * as fs from 'fs';
import {useEffect, useState} from "react";

export default function PodcastCommand() {
    const [podcast,setPodcast] = useState({ episodes: new Array<string>() });

    useEffect(() => {
        readEpisodes()
            .then(data => 
                setPodcast(() => { return { episodes: data }})
            )
    }, [])

    return (
        <List
            isLoading={podcast.episodes?.length === 0}
            searchBarPlaceholder="Filter by name ..."
        >
            {podcast.episodes.map(
                (episode) => <EpisodeItem key={episode} name={episode}/>
            )}  
        </List>

    );
}


async function readEpisodes() {
    const testFolder = '/Users/fkimmel/Dropbox/Podcast/Aufnahmen/';

    const files = fs.promises.readdir(testFolder)
        .then(files => files.filter((file) => !file.startsWith(".")));

    return files
}

interface EpisodeItemProps {
  name: string;
}

function EpisodeItem({ name } : EpisodeItemProps) {
    return (
        <List.Item
            title={name}
            actions={
            <ActionPanel title="Automation">
                <Action title="Run" onAction={() => exeAutomation(name)} />
            </ActionPanel>
            }
         />
    )
}

const exeAutomation = (name : string) => {
    const exec = require('child_process').execSync;
    const command = `cd /Users/fkimmel/Dropbox/Podcast/Aufnahmen/${name} && podcast ${name}.m4a && exit`
    exec(`osascript -e 'tell app "Terminal" to do script "${command}"'`)
}
