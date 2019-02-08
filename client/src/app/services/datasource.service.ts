import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

const PROTOCOL = 'http';
const PORT = 3000;
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class DatasourceService {
  baseUrl: string;
  auth_token: string;

  constructor(private httpClient: HttpClient) {
    this.baseUrl = `${PROTOCOL}://${location.hostname}:${PORT}/`;
  }

  authenticate(email: string, password: string): Observable<boolean> {
    const url = this.baseUrl + 'user/login';
    return this.httpClient.post<any>(url, { email, password }, httpOptions).pipe(
      tap((res: any) => {
        console.log(`res ${res}`);
        const r = res.json();
        this.auth_token = r.success ? r.token : null;
        return r.success;
      }),
      catchError(this.handleError<any>('authenticate'))
    );
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
  //     return this.httpClient.request(request).map(response => response.json());
  // }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
