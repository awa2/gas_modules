export default class AutoFolderingApp {
    Year: string;
    Month: string;
    rootFolderId: string;
    RootFolder: GoogleAppsScript.Drive.Folder;
    ReportFolder: GoogleAppsScript.Drive.Folder;
    YearFolder: GoogleAppsScript.Drive.Folder;
    MonthFolder: GoogleAppsScript.Drive.Folder;
  
    constructor(rootFolderId: string) {
      this.Year = Utilities.formatDate(new Date(), "JST", "yyyy");
      this.Month = Utilities.formatDate(new Date(), "JST", "MM");
  
      this.rootFolderId = rootFolderId;
      this.RootFolder = DriveApp.getFolderById(rootFolderId);
      this.YearFolder = this.createYearFolder();
      this.MonthFolder = this.createMonthFolder();
      this.ReportFolder = this.getReportFolder();
  
      return this;
    }
  
    setYear(year: string) {
      if (year.match(/(\d{4})/)) {
        this.Year = year;
      }
      return this;
    }
  
    getYear() {
      return this.Year;
    }
  
    setMonth(month: string) {
      if (month.match(/(\d{2})/)) {
        this.Month = month;
      }
      return this;
    }
  
    createYearFolder() {
      this.YearFolder;
  
      // Check Year Folder, and if undefined, generate it
      const YearsList = this.RootFolder.getFolders();
      while (YearsList.hasNext()) {
        var YearFolder = YearsList.next();
        if (YearFolder.getName() == this.Year) {
          this.YearFolder = DriveApp.getFolderById(YearFolder.getId());
          break;
        }
      }
      if (!this.YearFolder) {
        this.YearFolder = this.RootFolder.createFolder(this.Year);
      }
      return this.YearFolder;
    }
  
    createMonthFolder() {
      // Check Month Folder, and if undefined, generate it
      const MonthsList = this.YearFolder.getFolders();
      while (MonthsList.hasNext()) {
        var MonthFolder = MonthsList.next();
        if (MonthFolder.getName() == this.Month) {
          this.MonthFolder = DriveApp.getFolderById(MonthFolder.getId());
          break;
        }
      }
      if (!this.MonthFolder) {
        this.MonthFolder = this.YearFolder.createFolder(this.Month);
      }
      return this.MonthFolder;
    }
  
    getReportFolder() {
      this.YearFolder = this.createYearFolder();
      this.MonthFolder = this.createMonthFolder();
      return this.MonthFolder;
    }
  
    getName() { return this.MonthFolder.getName(); }
    getId() { return this.MonthFolder.getId(); }
  }