import { Component, OnInit, AfterViewInit } from '@angular/core';

declare var cvjs_setLicenseKeyPath: any;
declare var cvjs_InitCADViewerJS: any;
declare var cvjs_LoadDrawing: any;
declare var cvjs_windowResize_position: any;


@Component({
  selector: 'app-view-page',
  templateUrl: './view-page.component.html',
  styleUrls: ['./view-page.component.scss']
})
export class ViewPageComponent implements OnInit, AfterViewInit {
  fileNameNoExtension = 'E02_rotated'; // DWG NAME OF THE FILE TO BE LOADED INTO CADVIEWER JS!!!!!
  fileNamePath = '../../assets/drawings/viewing_sample/'; // PATH OF THE FILE TO BE LOADED INTO CADVIEWER JS!!!!!
  showSpinner = false;

  constructor() {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    cvjs_setLicenseKeyPath('../../assets/cadviewer/');
    cvjs_InitCADViewerJS('floorPlan');
    cvjs_LoadDrawing('floorPlan', this.fileNamePath, this.fileNameNoExtension);
    cvjs_windowResize_position(false, 'floorPlan');
  }
}
