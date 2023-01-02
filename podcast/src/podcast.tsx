import {Action, ActionPanel, List} from "@raycast/api";
import {QueryClient, QueryClientProvider, useQuery} from "react-query";
import * as fs from 'fs';

const podcastRoot = '/Users/fkimmel/Dropbox/Podcast/Aufnahmen';

interface EpisodeItemProps {
  name: string;
}

export default function PodcastCommand() {
    const queryClient = new QueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <EpisodeList/>
        </QueryClientProvider>
    );
}

const readEpisodes = () => fs.promises.readdir(podcastRoot)
        .then(files => files.filter((file) => !file.startsWith(".")));

function EpisodeList() {
    const data = useQuery("episodes", readEpisodes)?.data ?? [];
    return ( 
        <List searchBarPlaceholder="Filter by name ...">
            { data.map((title) => <Episode name={title} key={title}/>) }  
        </List>
    )
}

function Episode({ name } : EpisodeItemProps) {
    return (
        <List.Item title={name} actions={
            <ActionPanel title="Automation">
                <Action 
                    title="Run" 
                    onAction={() => exeAutomation(name)} />
                <Action 
                    title="Open" 
                    shortcut={{ modifiers: ["cmd"], key: "enter" }}
                    onAction={() => openEpisode(name)} />
            </ActionPanel>
        } />
    )
}

const openEpisode = (name : string) => {
    const exec = require('child_process').execSync;
    const path = `${podcastRoot}/${name}/`
    exec(`open "${path}"`)
}

const exeAutomation = (name : string) => {
    const exec = require('child_process').execSync;
    const command = `cd ${podcastRoot}/${name} && podcast ${name}.m4a && exit`
    exec(`osascript -e 'tell app "Terminal" to do script "${command}"'`)
}
