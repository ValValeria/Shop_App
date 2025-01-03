import {AfterViewInit, Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {auditTime} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from 'src/app/services/user.service';
import {merge} from 'rxjs';
import {AuthHelperService} from 'src/app/Classes/auth-helper.service';
import {IUser} from '../../interfaces/interfaces';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent implements AfterViewInit {
  isLogin = true;
  form: FormGroup;
  isValid = false;
  email: FormControl;
  showStatus = '';
  message: string;
  selectedIndex = 0;

  constructor(
    public readonly userService: UserService,
    private readonly builder: FormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authHelper: AuthHelperService) {

    const opt: [string, ValidatorFn[]] = ['', [Validators.minLength(10), Validators.maxLength(30), Validators.required]];

    this.form = builder.group({
      username: [...opt],
      password: [...opt],
    });

    this.message = 'Извините, но что-то случилось. Перезагрузите страницу и попробуйте ещё раз';

    this.email = new FormControl('', {
      validators: opt[1].concat(Validators.email)
    });

    merge(
      this.form.valueChanges,
      this.email.valueChanges
    )
      .pipe(
        auditTime(300)
      ).subscribe(v => {
      this.isValid = this.form.valid;
      if (this.form.valid && !this.isLogin) {
        this.isValid = this.email.valid;
      }
    });

    this.route.queryParamMap.subscribe(v => {
      const isLogin = v.get('isLogin');

      if (isLogin === 'true') {
        this.isLogin = true;
        this.selectedIndex = 0;
      } else {
        this.isLogin = false;
        this.selectedIndex = 1;
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.userService.is_auth) {
        const duration = 2000;

        this.snackBar.open('Вы уже вошли в систему', 'Close', {
          duration
        });

        setTimeout(async () => {
          await this.router.navigateByUrl('/profile');
        }, duration);
      }
    }, 5000);
  }

  click($event): void {
    if ($event.index === 1) {
      this.isLogin = false;
      this.selectedIndex = 1;
    } else if ($event.index === 0) {
      this.isLogin = true;
      this.selectedIndex = 0;
    }

    this.showStatus = '';
  }

  async submit($event): Promise<void> {
    $event.preventDefault();

    if (this.form.valid) {
      const data: IUser = {...this.form.value};

      if (!this.isLogin) {
        Object.assign(data, {email: this.email.value});
      }

      const messageWindow = this.snackBar.open('Отправляем данные на сервер', 'Close');

      try {
        messageWindow.closeWithAction();

        await this.authHelper.authenticate(data, this.isLogin);

        if (this.userService.is_auth) {
          localStorage.setItem('auth', JSON.stringify(this.userService));
          await this.router.navigateByUrl(`/profile/${this.userService.user.id}`);
        }
      } catch (e) {
        if (this.isLogin) {
          this.showStatus = 'Извините, но вас нет в нашей системе';
        } else {
          this.showStatus = 'Извините, но пользователь с такими данными уже есть в нашей базе';
        }

        localStorage.removeItem('auth');
      }
    } else {
      this.snackBar.open('Проверьте правильность формы', 'Close');
    }
  }
}
