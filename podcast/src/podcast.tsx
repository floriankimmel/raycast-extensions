import {Action, ActionPanel, List} from "@raycast/api";
import {QueryClient, QueryClientProvider, useQuery} from "react-query";
import {podcastRoot, readEpisodes} from "./readEpisodes";


interface EpisodeItemProps {
    name: string;
    callback: () => void;
}

export default function PodcastCommand() {
    const queryClient = new QueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <EpisodeList/>
        </QueryClientProvider>
    );
}


function EpisodeList() {
    const response = useQuery("episodes", readEpisodes);
    const data = response?.data ?? [];
    return ( 
        <List searchBarPlaceholder="Filter by name ...">
            { data.map((title) => <Episode name={title} key={title} callback={() => response.refetch()}/>) }  
        </List>
    )
}

function Episode({ name, callback } : EpisodeItemProps) {
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
                <Action
                    title="Delete" 
                    shortcut={{ modifiers: ["cmd"], key: "d" }}
                    onAction={() => deleteEpisode(name, callback)} />
            </ActionPanel>
        } />
    )
}

const deleteEpisode = (name : string, callback: () => void) => {
    const exec = require('child_process').execSync;
    const path = `${podcastRoot}/${name}/`
    exec(`rm -rf "${path}"`)

    callback()
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

