import { Request, Response, EventObject } from '../HTTP/HTTP';

const SLACK_API_URL = 'https://slack.com/api';
const WP_API_URL = 'https://graph.facebook.com';

namespace Notification {
    export type Option = {
        SlackBot?: {
            TOKEN: string,
            CH: string,
            BOT_NAME: string,
            MENTION: string,
        },
        Workplace?: {
            TOKEN: string,
            GROUP_ID: string
        },
        WorkplaceChat?: {
            TOKEN: string,
            THREAD_KEY: string
        }
        Email?: {
            to: string,
            cc: string
        }
    }
    export class App {
        private option: Notification.Option;
        public static Option = {}

        constructor(option: Notification.Option) {
            this.option = option;
        }

        public notify(attachment: Slack.Attachement) {
            this.notifyToEmail(attachment);
            this.notifyToSlack(attachment);
        }

        public notifyToEmail(attachment: Slack.Attachement, _to?: string, _cc?: string) {
            if (this.option.Email) {
                const emailOption = {
                    to: _to ? _to : this.option.Email.to,
                    cc: _cc ? _cc : this.option.Email.cc,
                    subject: attachment.title,
                    htmlBody: this.renderHTML(attachment),
                    noReply: true
                };

                console.log({ notifyToEmail: emailOption });
                MailApp.sendEmail(emailOption);
            }
        }

        public notifyToSlack(attachment: Slack.Attachement, _ch?: string, _mention?: string) {
            if (this.option.SlackBot) {
                const mention = _mention ? _mention : this.option.SlackBot.MENTION ? this.option.SlackBot.MENTION : '';
                attachment.pretext += ` @${mention.replace('@', '')}`;

                const payload = {
                    channel: _ch ? _ch : this.option.SlackBot.CH,
                    text: '',
                    link_names: 1,
                    parse: 'full',
                    username: this.option.SlackBot.BOT_NAME,
                    attachments: JSON.stringify([attachment])
                }

                console.log({ notifyToSlack: payload });
                return UrlFetchApp.fetch(`${SLACK_API_URL}/chat.postMessage`, {
                    method: 'post',
                    payload: payload,
                    headers: {
                        'Authorization': `Bearer ${this.option.SlackBot.TOKEN}`
                    }
                });
            }
        }

        public notifyToWorkplace(attachment: Slack.Attachement, _group_id?: string) {
            if (this.option.Workplace) {
                const payload = {
                    formatting: 'MARKDOWN',
                    message: this.renderMarkdown(attachment),
                    link: attachment.title_link ? attachment.title_link : attachment.author_link ? attachment.author_link : '',
                }
                const groud_id = _group_id ? _group_id : this.option.Workplace.GROUP_ID;

                console.log({ notifyToWorkplace: payload });
                return UrlFetchApp.fetch(`${WP_API_URL}/${groud_id}/feed`, {
                    method: 'post',
                    payload: payload,
                    headers: {
                        'Authorization': `Bearer ${this.option.Workplace.TOKEN}`
                    }
                });
            }
        }

        public notifyToWorkplaceChat(attachment: Slack.Attachement, _thread_key?: string) {
            if (this.option.WorkplaceChat) {
                const payload = {
                    message_type: "MESSAGE_TAG",
                    recipient: {
                        thread_key: _thread_key ? _thread_key : this.option.WorkplaceChat.THREAD_KEY
                    },
                    message: {
                        text: this.renderChatpost(attachment),
                    }
                }

                console.log({ notifyToWorkplaceChat: payload });
                return UrlFetchApp.fetch(`${WP_API_URL}/v2.6/me/messages`, {
                    method: 'post',
                    contentType: 'application/json; charset=utf-8',
                    payload: JSON.stringify(payload),
                    headers: {
                        'Authorization': `Bearer ${this.option.WorkplaceChat.TOKEN}`
                    }
                });
            }
        }

        public log(attachment: Slack.Attachement) {
            console.log({ log: attachment });
            Logger.log(JSON.stringify(attachment, null, 2));
        }

        private renderHTML(attachment: Slack.Attachement) {
            let html = '';

            html = attachment.pretext ? `<p>${attachment.pretext.replace('\n', '<br>\n')}</p>\n` : '';
            if (attachment.author_name) {
                html += attachment.author_link ? `<small><a href="${attachment.author_link}">${attachment.author_name}</a></small>` : `<small><${attachment.author_name}</small>`;
            }
            html += `<h2>${attachment.title}</h2>`;
            html += attachment.text ? `<p>${attachment.text.replace('\n', '<br>\n')}</p>` : '';
            if (attachment.fields) {
                html += attachment.fields.map(field => {
                    return `<p><b>${field.title}</b><br>\n${field.value}</p>`;
                }).join('\n');
            }
            html += attachment.footer ? `<small>${attachment.footer.replace('\n', '<br>\n')}</small>\n` : '';

            return html;
        }
        private renderMarkdown(attachment: Slack.Attachement) {
            let md = '';

            md = attachment.pretext ? `${attachment.pretext}` : '';
            md += '\n';
            if (attachment.author_name) {
                md += attachment.author_link ? `[${attachment.author_name}](${attachment.author_link})\n` : `(${attachment.author_name})\n`;
            }
            md += `# **${attachment.title}** \n`;
            md += attachment.text ? `${attachment.text.replace('\n', '  \n')}` : '';
            md += '\n';
            if (attachment.fields) {
                md += attachment.fields.map(field => {
                    return `**${field.title}**  \n${field.value}\n`;
                }).join();
            }
            md += '\n';
            md += attachment.footer ? `----\n${attachment.footer.replace('\n', '  \n')}\n` : '';
            return md;
        }
        private renderChatpost(attachment: Slack.Attachement) {
            let chatpost = '';

            chatpost += attachment.pretext ? `${attachment.pretext}\n` : '';
            chatpost += `# *${attachment.title}* \n${attachment.text}\n`;
            if (attachment.fields) {
                chatpost += attachment.fields.map(field => {
                    return `# *${field.title}*\n${field.value}\n`;
                }).join();
            }
            chatpost += attachment.title_link ? attachment.title_link : attachment.author_link ? attachment.author_link : '';
            chatpost += '\n';
            chatpost += attachment.footer ? `----\n${attachment.footer}` : ''
            return chatpost;
        }

        private updateToSlack(attachment: Slack.Attachement, _ch?: string) {
            if (this.option.SlackBot) {

                const payload = {
                    channel: _ch ? _ch : this.option.SlackBot.CH,
                    text: '',
                    link_names: 1,
                    parse: 'full',
                    username: this.option.SlackBot.BOT_NAME,
                    attachments: JSON.stringify([attachment])
                }

                console.log({ updateToSlack: payload });
                return UrlFetchApp.fetch(`${SLACK_API_URL}/chat.update`, {
                    method: 'post',
                    payload: payload,
                    headers: {
                        'Authorization': `Bearer ${this.option.SlackBot.TOKEN}`
                    }
                });
            }
        }
    }

    export namespace Slack {
        export type Payload = {
            channel: string,
            text: string,
            link_names?: '1',
            parse?: 'full' | 'none',
            username: string,
            attachments: string
        }
        export type Message = {
            text?: string,
            attachments?: Attachement[],
            thread_ts?: string,
            response_type?: 'in_channel' | 'ephemeral',
            replace_original?: boolean,
            delete_original?: boolean
        }
        export type Attachement = {
            fallback?: string,             //"Required plain-text summary of the attachment.",
            callback_id?: string,          //"wopr_game",
            color: string,                 //"#2eb886",
            attachment_type?: string,      //"default",
            actions?: Action[],
            pretext?: string,              //"Optional text that appears above the attachment block",
            author_name?: string,           //"Bobby Tables",
            author_link?: string,          //"http://flickr.com/bobby/",
            author_icon?: string,          //"http://flickr.com/icons/bobby.jpg",
            title?: string,                 //"Slack API Documentation",
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
        }
        export type Action = {
            name: string,
            text: string,
            type: string,
            value?: string,
            confirm?: Confirmation,
            style?: string,
            options?: Option[],
            option_groups?: OptionGroup[],
            data_source?: string,
            selected_options?: Option[],
            min_query_length?: number
        }
        export type Option = {
            text: string,
            value: string,
            description?: string
        }
        export type Confirmation = {
            title: string,
            text: string,
            ok_text: string,
            dismiss_Text: string,
        }
        export type OptionGroup = {
            text: string,
            options: Option[]

        }
        export type Invocation = {
            type: string,
            actions: Action[],
            callback_id: string,
            team: { id: string, domain: string },
            channel: { id: string, name: string },
            user: { id: string, name: string },
            action_ts: string,
            message_ts: string,
            attachment_id: string,
            token: string,
            original_message: Object,
            response_url: string
        }
        export type OptionsLoad = {
            name: string,
            value: string,
            callback_id: string,
            type: string,
            team: { id: string, domain: string },
            channel: { id: string, name: string },
            user: { id: string, name: string },
            action_ts: string,
            message_ts: string,
            attachment_id: string,
            token: string,
        }
    }
}

export default Notification;