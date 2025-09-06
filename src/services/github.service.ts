import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  private readonly http = inject(HttpClient);
  private readonly GITHUB_API_URL = 'https://api.github.com/users';

  getUser(username: string): Observable<any> {
    return this.http.get(`${this.GITHUB_API_URL}/${username}`).pipe(
      catchError(this.handleError)
    );
  }

  getRepos(username: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.GITHUB_API_URL}/${username}/repos?per_page=6&sort=updated`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    let errorMessage = 'حدث خطأ غير معروف!';
    if (error.status === 404) {
      errorMessage = `المستخدم غير موجود. يرجى التحقق من اسم المستخدم والمحاولة مرة أخرى.`;
    } else if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `خطأ: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `رمز الخطأ: ${error.status}\nالرسالة: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}