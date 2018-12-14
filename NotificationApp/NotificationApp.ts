declare const SlackApp: any;

export default class NotificationApp {
    public name: string;
    public ch: string
    public Slack: any;

    constructor(slack_env: string, bot_name: string, ch: string) {
        this.name = bot_name;
        this.ch = ch;
        this.Slack = SlackApp.create(slack_env);
    }

    public notify(option: NotificationOption) {
        this.notifyToEmail(option);
        this.notifyToSlack(option);
        this.log(option);
    }

    public notifyToEmail(option: NotificationOption){
        const attach = option.attachments[0];
        let htmlBody = '';

        htmlBody = attach.pretext ? `<p>${attach.pretext.replace('/n','<br>/n')}</p>/n` : '';
        if (attach.author_name) {
            htmlBody += attach.author_link ? `<small><a href="${attach.author_link}">${attach.author_name}</a></small>` : `<small><${attach.author_name}</small>`;
        }
        htmlBody += `<h2>${attach.title}</h2>`;
        htmlBody += attach.text ? `<p>${attach.text.replace('/n','<br>/n')}</p>` : '';
        if (attach.fields) {
            htmlBody += attach.fields.map(field => {
                return `<p><b>${field.title}</b><br>/n${field.value}</p>`;
            }).join('/n');
        }
        htmlBody += attach.footer ? `<small>${attach.footer.replace('/n','<br>/n')}</small>/n` : '';

        MailApp.sendEmail({
            to: option.to,
            cc: option.cc,
            subject: attach.title,
            htmlBody: htmlBody,
            noReply: true
        });
    }

    public notifyToSlack(option: NotificationOption, channel? : string){
        if(channel){
            this.Slack.postMessage(channel, '', { username: this.name, attachments: JSON.stringify(option.attachments) });
        } else {
            this.Slack.postMessage(this.ch, '', { username: this.name, attachments: JSON.stringify(option.attachments) });
        }
    }

    public log(option: NotificationOption){
        Logger.log(JSON.stringify(option,null,2));
        console.log(option);
    }
}

type NotificationOption = {
    to: string;
    cc: string;
    mention: string;
    attachments: Attachements;
}

type Attachements = Array<{
    fallback?: string,             //"Required plain-text summary of the attachment.",
    color: string,                 //"#2eb886",
    pretext?: string,              //"Optional text that appears above the attachment block",
    author_name: string,           //"Bobby Tables",
    author_link?: string,          //"http://flickr.com/bobby/",
    author_icon?: string,          //"http://flickr.com/icons/bobby.jpg",
    title: string,                 //"Slack API Documentation",
    title_link?: string,           //"https://api.slack.com/",
    text?: string,                 // "Optional text that appears within the attachment",
    fields?: Array<
    {
        title: string,             //"Priority",
        value: string,             //"High",
        short?: boolean,           //false
    }
    >,
    image_url?: string,            //"http://my-website.com/path/to/image.jpg",
    thumb_url?: string,            //"http://example.com/path/to/thumb.png",
    footer?: string,               //"Slack API",
    footer_icon?: string,          //"https://platform.slack-edge.com/img/default_application_icon.png",
    ts?: number                    //123456789
}>

function test_SlackBotApp(){
    
}