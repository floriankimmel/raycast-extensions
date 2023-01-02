import {Action, ActionPanel, Clipboard, Form, Icon, showToast, Toast} from '@raycast/api';
import {QueryClient, QueryClientProvider, useQuery} from "react-query";
import * as csv from 'csv-stringify';
import * as fs from 'fs';
import moment from 'moment';
import {podcastRoot, readEpisodes} from './readEpisodes';

export default function SocialMediaPlanningCommand() {
    const queryClient = new QueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <SocialMediaPlanningForm/>
        </QueryClientProvider>
    );
}
function SocialMediaPlanningForm() {
    const data = useQuery("episodes", readEpisodes)?.data ?? [];
    return (
        <Form actions={
                <ActionPanel>
                    <GenerateSocialMediaPlan />
                </ActionPanel>
            }>
            <Form.TextField id="number" title="Episode Number" value={estimateEpisodeNumber()}/>
            <Form.Dropdown id="title" title="Title" storeValue>
                { data.map((title) => 
                    <Form.Dropdown.Item value={title} title={title} key={title} />
                )}
            </Form.Dropdown>
            <Form.TextArea id="text" title="Text" />
            <Form.DatePicker id="publishDate" title="Publish Date" value={nextFriday().toDate()}/>
        </Form>
  );
}

const estimateEpisodeNumber = () => `${moment("2023/01/02", 'YYYY-MM-DD').diff(nextFriday(), 'week') + 181}`

function nextFriday() {
    const friday = 5;
    return (moment().isoWeekday() <= friday) 
        ? moment().isoWeekday(friday) 
        : moment().add(1, 'weeks').isoWeekday(friday);
    
}
function GenerateSocialMediaPlan() {
    async function handleSubmit(values: { number: string; title: string ; text: string; publishDate: Date }) {
        if (isInputFieldMissing(values)) {
            showToast({
                style: Toast.Style.Failure,
                title: "One ore more input is missing" 
            });
            return    
        }
        const toast = await showToast({
            style: Toast.Style.Animated,
            title: "Social Media Plan",
        });

        try {
            const path = `${podcastRoot}/${values.title}/`;
            const text = computeText(values)
            const data = generateCsv(text, values.title , values.publishDate)

            await Clipboard.copy(text);
            csv.stringify(data, (_, o) => fs.writeFileSync(`${path}/socialplan.csv`, o));

            toast.style = Toast.Style.Success;
            toast.message = "Successfully created";
        } catch (error) {
            toast.style = Toast.Style.Failure;
            toast.title = "Social Media Plan failed";
            toast.message = String(error);
            console.error(error);
        }
    }
    return <Action.SubmitForm icon={Icon.Anchor} key="generate" title="Generate" onSubmit={handleSubmit} />;
}

function isInputFieldSet(param: any) {
    return !param ? false : true
}

function isInputFieldMissing(values: { number: string; title: string ; text: string; publishDate: Date }) {
    return  !(isInputFieldSet(values.number) && isInputFieldSet(values.title) && 
    isInputFieldSet(values.text) && isInputFieldSet(values.publishDate)) 
}

function computeText(values : { number: string, text: string}){ 
return `${values.text}

Hört rein auf:
🔗Https://laufendentdecken.at/${values.number}/
Und natürlich auf
🎧Spotify, iTunes, Google Podcast, zencastr und in allen podcatchern über das RSS Feed.
✅ Folge uns auf Instagram @laufendentdeckenpodcast , @floderandere und @redendentdecken
Und auf Facebook https://www.facebook.com/laufendentdeckenpodcast/
#laufendentdecken
#laufen #interview
#podcast #running #ultrarunning`; 
}

function generateCsv(text: string, title: string, date: Date){
    const publishDate = moment(date);

    const friday = publishDate.format('YYYY-MM-DD'); 
    const saturday = publishDate.add(1, 'days').format('YYYY-MM-DD');
    const sunday = publishDate.add(1, 'days').format('YYYY-MM-DD');
    const wednesday = publishDate.add(3, 'days').format('YYYY-MM-DD');

    const pictureBasePath = 'https://rssfeed.laufendentdecken-podcast.at/data'   

    const data = [["Text","Date","Time","Draft","Facebook","Instagram","Picture Url 1","Shortener","Instagram Post Type","Facebook Post Type","Facebook Title","Brand name"]]
    data.push(["''",friday, "09:15", "FALSE","FALSE", "TRUE", `${pictureBasePath}/${title}_fridaystory.png`,"TRUE", "STORY","","",""])
    data.push([text, friday, "19:00", "FALSE","TRUE", "TRUE", `${pictureBasePath}/${title}_fridaypost.png`,"TRUE", "POST","POST","",""])
    data.push(["''", saturday, "19:00", "FALSE","FALSE", "TRUE", `${pictureBasePath}/${title}_saturdaystory.png`,"TRUE", "STORY","","",""])
    data.push(["''", sunday, "19:00", "FALSE","FALSE", "TRUE", `${pictureBasePath}/${title}_sundaystory.png`,"TRUE", "STORY","","",""])
    data.push([text, wednesday, "19:00", "FALSE","TRUE", "TRUE", `${pictureBasePath}/${title}_wednesdaypost.png`,"TRUE", "POST","POST","",""])
    return data
}
