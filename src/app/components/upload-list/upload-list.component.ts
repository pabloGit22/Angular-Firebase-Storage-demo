import { Component, OnInit } from '@angular/core';
import { FileUploadService } from 'src/app/services/file-upload.service';
import {Observable} from "rxjs";
import {FileUpload} from "../../models/file-upload.model";

@Component({
  selector: 'app-upload-list',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.css']
})
export class UploadListComponent implements OnInit {
  fileUploads$!: Observable<FileUpload[]>;

  constructor(private uploadService: FileUploadService) { }

  ngOnInit() {
    this.fileUploads$ = this.uploadService.getFiles();
  }
}
