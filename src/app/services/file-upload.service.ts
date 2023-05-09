import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FileUpload } from '../models/file-upload.model';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private basePath = '/uploads';

  constructor(private Fs: AngularFirestore, private storage: AngularFireStorage) { }

  pushFileToStorage(fileUpload: FileUpload): Observable<number | undefined> {
    const filePath = `${this.basePath}/${fileUpload.file.name}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);

    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe(downloadURL => {
          fileUpload.url = downloadURL;
          fileUpload.name = fileUpload.file.name;
          this.saveFileData(fileUpload);
        });
      })
    ).subscribe();

    return uploadTask.percentageChanges();
  }

  private saveFileData(fileUpload: FileUpload): void {
    // El campo File no se puede/debe almacenar en el Firestore
    this.Fs.collection(this.basePath).doc().set({name: fileUpload.name, url: fileUpload.url});
  }

  getFiles(): Observable<FileUpload[]> {
    return this.Fs.collection<FileUpload>(this.basePath).valueChanges({ idField: 'id' });
  }

  deleteFile(fileUpload: FileUpload): void {
    this.deleteFileDatabase(fileUpload.id)  // borra registro de Firestore
      .then(() => {
        this.deleteFileStorage(fileUpload.url);  // borra fichero de Storage
      })
      .catch(error => console.log(error));
  }
  private deleteFileDatabase(id: string): Promise<void> {
    return this.Fs.doc(this.basePath + '/' + id).delete();
  }
  private deleteFileStorage(url: string): void {
    this.storage.refFromURL(url).delete();
  }
}
