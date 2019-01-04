export namespace EventObject {
    export type Request = {
        queryString?: string | null,
        parameter?: { [key: string]: Object },
        parameters?: { [key: string]: Array<Object> },
        contextPath?: string,
        contentLength?: number,
        postData?: {
            length: number,
            type: string,
            contents: string,
            name: string
        }
    }
}

export class Response {
    private output: GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput;
    private mimetype: GoogleAppsScript.Content.MimeType | 'HTML';
    constructor() {
        this.output = ContentService.createTextOutput();
        this.mimetype = 'HTML';
    }
    public json(json: Object) {
        this.output = ContentService.createTextOutput(JSON.stringify(json));
        this.output.setMimeType(GoogleAppsScript.Content.MimeType.JSON);
        this.mimetype = GoogleAppsScript.Content.MimeType.JSON;
        return this;
    }
    public render(filename: string, variable?: { [key: string]: Object }, title?: string) {
        const Template = HtmlService.createTemplateFromFile(filename);
        if (variable) {
            for (const key in variable) {
                if (variable.hasOwnProperty(key)) {
                    // Object.defineProperty(Template, key, variable[key]);
                    (Template as {[key: string]: any})[key] = variable[key];
                }
            }
        }
        this.output = Template.evaluate();
        if (title) { this.output.setTitle(title); }
        return this;
    }
    public type(type: GoogleAppsScript.Content.MimeType | 'HTML') {
        this.mimetype = type;
        return this;
    }
    public send(content?: string | Object) {
        if(content){
            if (typeof content === 'string') {
                if (this.mimetype === 'HTML') {
                    this.output = HtmlService.createHtmlOutput().setContent(content);
                } else {
                    this.output = ContentService.createTextOutput(content);
                    this.output.setMimeType(this.mimetype);
                }
            } else {
                return this.json(content as Object);
            }
        } else {
            return this.end();
        }
    }
    public end() {
        return true;
    }
    public out() {
        return this.output;
    }
}
export class Request {
    // baseUrl? : string;
    public body?: { [key: string]: any };
    public method: 'POST' | 'GET';
    public originUrl: string;
    // params : string;
    public path: string;
    public protocol: 'https';
    public query: { [key: string]: any } | undefined

    constructor(e: EventObject.Request) {
        if (e['postData']) {
            switch (e.postData['contents']) {
                case 'application/json':
                    this.body = JSON.parse(e.postData.contents);
                    break;
                case 'application/x-www-form-urlencoded':
                    const body: { [key: string]: any } = {};
                    const qs = e.postData.contents.split('&');
                    qs.forEach(q =>{
                        const key = q.split('=')[0];
                        const val = q.split('=')[1];
                        body[key] = val;
                    });
                    this.body = body;
                    break;
                default:
                    this.body = undefined;
                    break;
            }
            this.method = 'POST';
        } else {
            this.method = 'GET';
        }
        this.originUrl = e['queryString'] ? `/exec?${e.queryString}` : '/exec';
        this.path = '/exec';
        this.protocol = 'https';
        this.query = e['parameter'] ? e.parameter : undefined;
    }

}
export class WebApp {
    private routes: { [method in 'GET' | 'POST']: { [key: string]: Object }[] };
    private callbacks: { [method in 'GET' | 'POST']: Function[] };
    constructor() {
        this.routes = { GET: [], POST: [] };
        this.callbacks = { GET: [], POST: [] };
    }
    public web(e: EventObject.Request) {
        const req = new Request(e);
        const res = new Response();
        const ret: Object[] = [];

        this.routes[req.method].some((route, i) => {
            if (route && (req.query !== {}) && (req.query !== undefined)) {
                let route_is_matched = true;
                for (const key in route) {
                    route_is_matched = route_is_matched && (route[key] === req.query[key])
                }
                if (route_is_matched) {
                    const callback = this.callbacks[req.method][i];
                    const result = callback(req, res);
                    if (result === true) {
                        return true;
                    }
                }
            } else {
                if (route === {}) {
                    const callback = this.callbacks[req.method][i];
                    const result = callback(req, res);
                    if (result === true) {
                        return true;
                    }
                }
            }
            return false;
        });
        return res.out();
    }
    public get(path: { [key: string]: Object }, callback: (req: Request, res: Response) => any) {
        this.routes['GET'].push(path);
        this.callbacks['GET'].push(callback);
        return this;
    }
    public post(path: { [key: string]: Object }, callback: (req: Request, res: Response) => any) {
        this.routes['POST'].push(path);
        this.callbacks['POST'].push(callback);
        return this;
    }
}

export function include(filename: string, params?: { [key: string]: Object }) {
    var Template = HtmlService.createTemplateFromFile(filename);
    if(params){
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                (Template as {[key: string]: any})[key] = params[key];
            }
        }
    }
    return Template.evaluate();
}