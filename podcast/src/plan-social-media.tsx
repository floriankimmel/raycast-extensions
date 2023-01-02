import {Action, ActionPanel, Form, Icon, showToast, Toast} from '@raycast/api';
import {QueryClient, QueryClientProvider, useQuery} from "react-query";
import * as csv from 'csv-stringify';
import * as fs from 'fs';
import moment from 'moment';

const podcastRoot = '/Users/fkimmel/Dropbox/Podcast/Aufnahmen';

export default function SocialMediaPlanningCommand() {
    const queryClient = new QueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <SocialMediaPlanningForm/>
        </QueryClientProvider>
    );
}
export const readEpisodes = () => fs.promises.readdir(podcastRoot)
        .then(files => files.filter((file) => !file.startsWith(".")));

function SocialMediaPlanningForm() {
    const data = useQuery("episodes", readEpisodes)?.data ?? [];
    return (
        <Form actions={
                <ActionPanel>
                    <GenerateSocialMediaPlan />
                </ActionPanel>
            }>
            <Form.TextField id="number" title="Episode Number" />
            <Form.Dropdown id="title" title="Title" storeValue>
                { data.map((title) => 
                    <Form.Dropdown.Item value={title} title={title} key={title} />
                )}
            </Form.Dropdown>
            <Form.TextArea id="text" title="Text" />
            <Form.DatePicker id="publishDate" title="Publish Date" />
        </Form>
  );
}
function GenerateSocialMediaPlan() {
  async function handleSubmit(values: { number: string; title: string ; text: string; publishDate: Date }) {
    if (!values.number) {
      showToast({
        style: Toast.Style.Failure,
        title: "Episode number is required",
      });
      return;
    }

    if (!values.title) {
      showToast({
        style: Toast.Style.Failure,
        title: "Episode title is required",
      });
      return;
    }

    if (!values.text) {
      showToast({
        style: Toast.Style.Failure,
        title: "Episode text is required",
      });
      return;
    }

    if (!values.publishDate) {
      showToast({
        style: Toast.Style.Failure,
        title: "Episode publish date is required",
      });
      return;
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Create Social Media Plan",
    });

    try {
        const path = `${podcastRoot}/${values.title}/`;
        const text=  
            `${values.text}

             Hört rein auf:
             🔗Https://laufendentdecken.at/${values.number}/
             Und natürlich auf
             🎧Spotify, iTunes, Google Podcast, zencastr und in allen podcatchern über das RSS Feed.
             ✅ Folge uns auf Instagram @laufendentdeckenpodcast , @floderandere und @redendentdecken
             Und auf Facebook https://www.facebook.com/laufendentdeckenpodcast/
             #laufendentdecken
             #laufen #interview
             #podcast #running #ultrarunning`; 

        const publishDate = moment(values.publishDate);
 
        const friday = publishDate.format('YYYY-MM-DD'); 
        const saturday = publishDate.add(1, 'days').format('YYYY-MM-DD');
        const sunday = publishDate.add(1, 'days').format('YYYY-MM-DD');
        const wednesday = publishDate.add(3, 'days').format('YYYY-MM-DD');



        const pictureBasePath = 'https://rssfeed.laufendentdecken-podcast.at/data'   

        const data = [["Text","Date","Time","Draft","Facebook","Instagram","Picture Url 1","Shortener","Instagram Post Type","Facebook Post Type","Facebook Title","Brand name"]]
        data.push(["''",friday, "09:15", "FALSE","FALSE", "TRUE", `${pictureBasePath}/${values.title}_fridaystory.png`,"TRUE", "STORY","","",""])
        data.push([text, friday, "19:00", "FALSE","TRUE", "TRUE", `${pictureBasePath}/${values.title}_fridaypost.png`,"TRUE", "POST","POST","",""])
        data.push(["''", saturday, "19:00", "FALSE","FALSE", "TRUE", `${pictureBasePath}/${values.title}_saturdaystory.png`,"TRUE", "STORY","","",""])
        data.push(["''", sunday, "19:00", "FALSE","FALSE", "TRUE", `${pictureBasePath}/${values.title}_sundaystory.png`,"TRUE", "STORY","","",""])
        data.push([text, wednesday, "19:00", "FALSE","TRUE", "TRUE", `${pictureBasePath}/${values.title}_wednesdaypost.png`,"TRUE", "POST","POST","",""])

        csv.stringify(data, (_, o) => fs.writeFileSync(`${path}/socialplan.csv`, o));

        toast.style = Toast.Style.Success;
        toast.title = "Social Media Plan";
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
