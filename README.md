# GAS Modules
Utility modules for Google Apps Script with TypeScript

## AutoFolderingApp
Making annualy or monthly named folder on your Goolge Drive such as below:
```
RootFolder
 |- 2017
 `- 2018
    |- 01
    |- 02
    |- 03
    `- 04 <= YOUR_APRIL_LOGS
        |- 2018-04-01_foo.logs
        |- 2018-04-02_foo.logs
                :
```
### Example
```TypeScript
const rootFolderId = '<YOUR_ROOT_FOLDER_ID>';
const LogFolder = new AutoFolderApp(reportRootFolderId).setYear(2018).setMonth(04).getReportFolder();

console.log(LogFolder.getId());
```

## NotificationApp
Notify by Slack, Gmail and Workplaces.

## HTTP
Handle HTTP request and response on Google Apps Script.
HTTP module provides Express like Request object and response object.(Only GET and POST methods.)

## Table
Handle Spreadsheet like as database.
Table module provides CRUD like interface and JSON based data handling with Google Spreadsheet.

### Example
```TypeScript
const Users = new Table('<YOUR_SPREADSHEET_ID>',123456);
Users.add({ name : 'John Smith', age : 20});

const user = Users.get(1);
user.age = 21;
Users.update(user);
```

## Process
Process module provides Google Apps Script process and env service.
### Env
You can handle ScriptProperty like as `process.env` of nodejs.
```TypeScript
import process from './Process/Process';

const token = process.env['TOKEN'];
// it means below:
// const token = PropertiesService.getScriptProperties().getProperty('TOKEN')
```
### Event store
Event store method can store `EventObject` in order to test.
```TypeScript
import process from './Process/Process';

function doGet(e){
    process.event.store(e);
    return callback(e);
}

function test_doGet(){
    const e = process.event.load();
    return callback(e);
}
```