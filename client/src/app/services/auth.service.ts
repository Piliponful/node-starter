import { Injectable } from '@angular/core';
import { DatasourceService } from './datasource.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private datasource: DatasourceService) { }

  authenticate(username: string, password: string): Observable<boolean> {
    return this.datasource.authenticate(username, password);
  }

  get authenticated(): boolean {
    return this.datasource.auth_token != null;
  }

  clear() {
    localStorage.removeItem('currentUser');
    this.datasource.auth_token = null;
  }
}
