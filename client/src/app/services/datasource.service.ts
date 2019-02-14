import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

const PROTOCOL = 'http';
const PORT = 3000;
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
};

@Injectable({
  providedIn: 'root'
})
export class DatasourceService {
  baseUrl: string;
  auth_token: string;
  private currentUserSubject: BehaviorSubject<any>;

  constructor(private http: HttpClient) {
    this.baseUrl = `${PROTOCOL}://${location.hostname}:${PORT}/`;
  }

  authenticate(email: string, password: string) {
    return this.http.post('/api/user/login', { email, password }, httpOptions)
      .pipe(
        tap((res: any) => {
            if (res.error) {
              return res.error;
            } else {
              this.auth_token = res ? res.value : null;
              localStorage.setItem('currentUser', JSON.stringify(this.auth_token));
              return res;
            }
        })
      );
  }

  inviteUser(firstname, lastname, email, tenantAdmin, tenantId, message) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    const jwt = this.currentUserSubject.value;
    return this.http.post('/api/user', { jwt, firstname, lastname, email, tenantAdmin, tenantId, message }, httpOptions)
      .pipe(
        tap((res: any) => {
          return res;
        }));
  }

  finishRegistration(finishRegistrationCode, additionalFields) {
    return this.http.post('/api/user/finish-registration', { finishRegistrationCode, additionalFields }, httpOptions)
      .pipe(
        tap((res: any) => {
          return res;
        }));
  }

  getUser() {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    const jwt = this.currentUserSubject.value;
    return this.http.post('/api/user/byJwt', { jwt }, httpOptions)
      .pipe(
        tap((res: any) => {
          return res;
        }));
  }

  getUsers() {
    return this.http.post('/api/user', httpOptions)
      .pipe(
        tap((res: any) => {
          return res;
        }));
  }

  // private sendRequest(
  //   verb: RequestMethod,
  //   url: string, body?: any, auth: boolean = false): Observable<any> {
  //     const request = new Request({
  //       method: verb,
  //       url: this.baseUrl + url,
  //       body: body
  //     });
  //     if (auth && this.auth_token !== null) {
  //       request.headers.set('Authorization', `Bearer<${this.auth_token}>`);
  //     }
  //     return this.http.request(request).map(response => response.json());
  // }
}
