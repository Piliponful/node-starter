import { Component, OnInit, AfterViewInit } from '@angular/core';

declare var cvjs_resetZoomPan: any;
declare var cvjs_setLicenseKeyPath: any;
declare var cvjs_setPanState: any;
declare var cvjs_InitCADViewerJS: any;
declare var cvjs_LoadDrawing: any;
declare var cvjs_windowResize_position: any;
declare var cvjs_encapsulateUrl_callback: any;

@Component({
  selector: 'app-view-page',
  templateUrl: './view-page.component.html',
  styleUrls: ['./view-page.component.scss']
})
export class ViewPageComponent implements OnInit, AfterViewInit {
  fileNameNoExtension = 'E02_rotated'; // DWG NAME OF THE FILE TO BE LOADED INTO CADVIEWER JS!!!!!
  fileNamePath = '../../assets/drawings/viewing_sample/'; // PATH OF THE FILE TO BE LOADED INTO CADVIEWER JS!!!!!

  constructor() {}

  ngOnInit() {
  }

  // generic callback method, called when drawing or page is fully loaded
  cvjs_OnLoadEnd() {
    // generic callback method, called when the drawing is loaded
    // here you fill in your stuff, call DB, set up arrays, etc..
    // this method MUST be retained as a dummy method! - if not implemeted -
    cvjs_resetZoomPan();
  }

  // generic callback method, tells which FM object has been clicked
  cvjs_change_space(object) {
  }

  cvjs_ObjectSelected(rmid) {
    // placeholder for method in tms_cadviewerjs_modal_1_0_14.js   - must be removed when in creation mode and using creation modal
  }

  ngAfterViewInit() {
    cvjs_setLicenseKeyPath('../../assets/cadviewer/');
    cvjs_setPanState(true);
    // cvjs_setUrl_singleDoubleClick(1);
    cvjs_encapsulateUrl_callback(true);
    // Initialize CADViewer JS
    cvjs_InitCADViewerJS('floorPlan');
    // load Standard drawing
    cvjs_LoadDrawing('floorPlan', this.fileNamePath, this.fileNameNoExtension);
    cvjs_windowResize_position(false, 'floorPlan');
  }
}
