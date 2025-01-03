import {Injectable} from '@angular/core';
import {ActivatedRoute, CanLoad, Route, Router, UrlSegment, UrlTree} from '@angular/router';
import {AuthHelperService} from '../Classes/auth-helper.service';
import {UserService} from '../services/user.service';
import {Roles} from './only-super-admin.guard';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable()
export class OnlyAuthGuard implements CanLoad {

  constructor(
    private readonly userService: UserService,
    private readonly auth: AuthHelperService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar) {
  }

  async canLoad(router: Route, segments: UrlSegment[]): Promise<boolean | UrlTree> {
    const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);

    if (!this.userService.is_auth) {
      await this.auth.authenticate(this.userService.user, true);
    }

    if (this.userService.user.role !== Roles.ADMIN && this.userService.user.id !== id) {
      await this.router.navigateByUrl('/');

      this.snackBar.open('Only admin can visit the page', 'Close');

      return false;
    }

    return true;
  }
}
