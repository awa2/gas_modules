export class Response {
    constructor(){

    }
    public json(){}
    public type(){}
    public render(){}
    public send(){}
}
export class Request {
    // baseUrl? : string;
    public body? : string;
    public method : 'POST' | 'GET';
    public originUrl : string;
    // params : string;
    public path : string;
    public protocol : 'https';
    public query : { [key : string] : any }
    
    constructor(e: any){
        if(e['postData']){
            switch (e.postData['contents']) {
                case 'application/json':
                    this.body = JSON.parse(e.postData.contents);
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
export function httpRequest(e: any){
    return new Request(e);
}