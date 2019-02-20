import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatasourceService } from '../../services/datasource.service';

// declare var cvjs_setLicenseKeyPath: any;
// declare var cvjs_InitCADViewerJS: any;
// declare var cvjs_LoadDrawing: any;
// declare var cvjs_windowResize_position: any;
declare var DxfParser: any;
declare var THREE: any;
declare var ThreeDxf: any;

@Component({
  selector: 'app-view-page',
  templateUrl: './view-page.component.html',
  styleUrls: ['./view-page.component.scss']
})
export class ViewPageComponent implements OnInit, AfterViewInit {
  fileNameNoExtension = '5c6d49a9821732003536ebd8'; // DWG NAME OF THE FILE TO BE LOADED INTO CADVIEWER JS!!!!!
  fileNamePath = 'http://localhost:4200/api/dxf-file/'; // PATH OF THE FILE TO BE LOADED INTO CADVIEWER JS!!!!!
  showSpinner = false;

  constructor(private route: ActivatedRoute, private datasourceService: DatasourceService) {}

  ngOnInit() {
    this.getDXFFileById(this.route.params['value'].id);
  }

  ngAfterViewInit() {
    // cvjs_setLicenseKeyPath('../../assets/cadviewer/');
    // cvjs_InitCADViewerJS('floorPlan');
    // cvjs_LoadDrawing('floorPlan', this.fileNamePath, this.fileNameNoExtension);
    // cvjs_windowResize_position(false, 'floorPlan');
  }

  getDXFFileById(id) {
    this.datasourceService.getDXFFile(id).subscribe((res) => {
      const loader = new THREE.FontLoader();

      loader.load('../../assets/helvetiker_regular.typeface.json', function ( font ) {
        const parser = new DxfParser();
        const dxf = parser.parseSync(res.value);
        const a = new ThreeDxf.Viewer(dxf, document.getElementById('cad-view'), 400, 400, font);
      });
    });
  }
}
