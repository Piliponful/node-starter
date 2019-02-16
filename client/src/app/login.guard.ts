import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { DatasourceService } from './services/datasource.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  private currentUserSubject: BehaviorSubject<any>;

  constructor(private router: Router, private datasourceService: DatasourceService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
      if (this.currentUserSubject.value !== null) {
        return true;
      } else {
        this.router.navigateByUrl('/login');
        return false;
      }
  }
}
