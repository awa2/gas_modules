import Notification from "../NotificationApp/Notification";

class Process {
    public id: string = ScriptApp.getScriptId();
    public env: { [key: string]: Object };

    public CurrentUser: { email: string } = { email: Session.getActiveUser().getEmail() };
    public EffectiveUser: { email: string, access_token?: string } = { email: Session.getActiveUser().getEmail(), access_token: ScriptApp.getOAuthToken() };

    public web: { url: string } = { url: ScriptApp.getService().isEnabled() ? ScriptApp.getService().getUrl() : '' };
    public event: EventStore;
    public mode: string = Process.MODE.PRODUCTION;
    private reporting: Function = function(){};

    public static MODE = class {
        public static get PRODUCTION(): string { return 'production'; }
        public static get STAGING(): string { return 'staging'; }
        public static get DEVELOPMENT(): string { return 'development'; }
    }

    constructor(EnvObject?: Object) {
        if (EnvObject) {
            PropertiesService.getScriptProperties().setProperties(EnvObject, false);
        }

        this.env = {};

        const properties = PropertiesService.getScriptProperties().getProperties();
        for (const key in properties) {
            if (properties.hasOwnProperty(key)) {
                const property = (properties as {[key: string]: any})[key];
                try {
                    this.env[key] = JSON.parse(property);
                } catch (e) {
                    this.env[key] = property;
                }
            }
        }

        this.event = new EventStore();
    }

    public log(obj: Object) {
        console.log(obj);
        Logger.log(JSON.stringify(obj, null, 2));
    }
    public debug(obj: Object) {
        switch (this.mode) {
            case Process.MODE.PRODUCTION:
                break;
            case Process.MODE.STAGING:
                console.log(obj);
                Logger.log(JSON.stringify(obj, null, 2));
                break;
            case Process.MODE.DEVELOPMENT:
                console.log(obj);
                Logger.log(JSON.stringify(obj, null, 2));
                break;

            default:
                break;
        }
    }
    public setReportTo(func: Function){
        this.reporting = func;
    }
}

class EventStore {
    private e: string;
    constructor() {
        this.e = JSON.stringify({});
    }
    public store(e: Object) {
        this.e = JSON.stringify(e);
    }
    public load() {
        return JSON.parse(this.e);
    }
}

const process = new Process();

export default process;